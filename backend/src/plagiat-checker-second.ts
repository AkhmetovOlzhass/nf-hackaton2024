import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
import axios from 'axios';
import { bot } from './telegramBot';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI!;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const pc = new Pinecone({
    apiKey: PINECONE_API_KEY,
});
const index = pc.Index('repos');

const git = simpleGit();

export const getRepositoryName = (repoUrl: string): string => {
    return repoUrl.split('/').slice(-1).join('/');
};

export const searchRepositories = async (query: string): Promise<string[]> => {
    try {
        const response = await axios.get(`https://api.github.com/search/repositories`, {
            params: {
                q: query,
                sort: 'stars',
                order: 'desc',
            },
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        const repos = response.data.items.map((repo: any) => repo.html_url);
        return repos;
    } catch (error) {
        console.error('Ошибка при поиске репозиториев:', error);
        return [];
    }
};

export const clearPinecone = async () => {
    const stats = await index.describeIndexStats();
    if (stats && stats.namespaces && Object.keys(stats.namespaces).length > 0) {
        await index.deleteAll();
        console.log('Pinecone векторная база данных очищена.');
    }
};

export const getAllCodeFiles = async (dir: string, fileList: string[] = [], extensions: string[] = ['.js', '.jsx', '.ts', '.tsx']): Promise<string[]> => {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.promises.stat(filePath);

        if (stat.isDirectory()) {
            await getAllCodeFiles(filePath, fileList, extensions);
        } else if (extensions.includes(path.extname(file))) {
            fileList.push(filePath);
        }
    }

    return fileList;
};

export const getFilesContent = async (filePaths: string[]): Promise<string[]> => {
    const contents = await Promise.all(filePaths.map(async (filePath) => {
        return await fs.promises.readFile(filePath, 'utf-8');
    }));
    return contents;
};

export const splitContentIntoChunks = (content: string, chunkSize: number = 8000): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
};

export const getEmbeddings = async (contents: string[]): Promise<number[][]> => {
    try {
        const embeddings: number[][] = [];
        for (const content of contents) {
            const chunks = splitContentIntoChunks(content);
            for (const chunk of chunks) {
                const response = await openai.embeddings.create({
                    model: 'text-embedding-ada-002',
                    input: chunk,
                });
                embeddings.push(response.data[0].embedding);
            }
        }
        return embeddings;
    } catch (error) {
        console.error('Ошибка при создании встраиваний:', error);
        throw error;
    }
};

export const addRepoToPinecone = async (repoUrl: string, embeddings: number[][]): Promise<void> => {
    try {
        const upserts = embeddings.map((embedding, idx) => ({
            id: `${repoUrl}-${idx}`,
            values: embedding,
        }));
        await index.upsert(upserts);
    } catch (error) {
        console.error('Ошибка при добавлении встраиваний в Pinecone:', error);
        throw error;
    }
};

export const checkSimilarity = async (repoEmbeddings: number[][]): Promise<{ repoUrl: string | null, similarity: number }> => {
    let maxSimilarity = 0;
    let mostSimilarRepo: string | null = null;

    try {
        for (const embedding of repoEmbeddings) {
            const queryResponse = await index.query({
                topK: 1,
                vector: embedding,
                includeValues: true,
            });

            const matches = queryResponse.matches;
            if (matches && matches.length > 0) {
                const similarity = matches[0].score;
                if (similarity !== undefined && similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                    mostSimilarRepo = matches[0].id.split('-').slice(0, -1).join('-');
                    console.log(`Found match with similarity ${similarity} for repo ${mostSimilarRepo}`);
                }
            }
        }
    } catch (error) {
        console.error('Ошибка при проверке схожести:', error);
        throw error;
    }

    return {
        repoUrl: mostSimilarRepo,
        similarity: maxSimilarity,
    };
};

export const deleteReposFolder = async () => {
    const reposPath = path.join(__dirname, 'repos');
    try {
        await fs.promises.rm(reposPath, { recursive: true, force: true });
        console.log('Папка repos удалена.');
    } catch (error) {
        console.error('Ошибка при удалении папки repos:', error);
    }
};


export const cloneRepository = async (repoUrl: string, repoPath: string): Promise<void> => {

    if (fs.existsSync(repoPath)) {
        await fs.promises.rm(repoPath, { recursive: true, force: true });
    }
    await git.clone(repoUrl, repoPath);
};

export const getRepoFileExtensions = async (repoPath: string): Promise<string[]> => {
    const filePaths = await getAllCodeFiles(repoPath);
    const extensions = new Set<string>();
    for (const filePath of filePaths) {
        const ext = path.extname(filePath);
        extensions.add(ext);
    }
    return Array.from(extensions);
};

export const checkRepoForPlagiarism = async (repoUrl: string, chatId): Promise<{ mostSimilarRepo: string | null, similarityPercentage: string } | null> => {
    console.log(`Cloning candidate repository: ${repoUrl}`);
    bot.sendMessage(chatId, `Cloning candidate repository: ${repoUrl}`);

    const repoName = getRepositoryName(repoUrl);
    const repoPath = path.join(__dirname, 'repos', repoName);
    await cloneRepository(repoUrl, repoPath);

    console.log('Getting file extensions from candidate repository...');
    bot.sendMessage(chatId, 'Getting file extensions from candidate repository...');
    const candidateExtensions = await getRepoFileExtensions(repoPath);
    console.log('Candidate repository uses the following extensions:', candidateExtensions);
    bot.sendMessage(chatId, 'Candidate repository uses the following extensions: ' + candidateExtensions);

    console.log('Searching for similar repositories on GitHub...');
    bot.sendMessage(chatId, 'Searching for similar repositories on GitHub...');
    const inputRepos = await searchRepositories(repoName);

    if (inputRepos.length === 0) {
        return null;
    }

    console.log('Clearing Pinecone vector database...');
    await clearPinecone();

    let mostSimilarRepo: string | null = null;
    let maxSimilarity = 0;

    bot.sendMessage(chatId, 'Start loading data...');

    for (const similarRepoUrl of inputRepos) {
        if (similarRepoUrl === repoUrl) {
            console.log(`Skipping candidate's own repository: ${similarRepoUrl}`);
            continue;
        }

        console.log(`Cloning similar repository: ${similarRepoUrl}`);
        const similarRepoName = path.basename(similarRepoUrl, '.git');
        const similarRepoPath = path.join(__dirname, 'repos', similarRepoName);

        await cloneRepository(similarRepoUrl, similarRepoPath);
        const filePaths = await getAllCodeFiles(similarRepoPath, [], candidateExtensions);

        if (filePaths.length === 0) {
            console.log(`No relevant code files found in ${similarRepoUrl}, skipping.`);
            continue;
        }

        const repoContent = await getFilesContent(filePaths);
        const repoEmbeddings = await getEmbeddings(repoContent);

        console.log(`Adding similar repository ${similarRepoUrl} to Pinecone...`);
        await addRepoToPinecone(similarRepoUrl, repoEmbeddings);
        console.log(`Similar repository ${similarRepoUrl} successfully added to Pinecone`);

        const { repoUrl: similarRepo, similarity } = await checkSimilarity(repoEmbeddings);

        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarRepo = similarRepo;
        }

        
    }

    console.log('Deleting cloned repositories folder...');
    bot.sendMessage(chatId, 'Deleting cloned repositories folder...');
    await deleteReposFolder();

    if (mostSimilarRepo!= null) {
        return {
            mostSimilarRepo,
            similarityPercentage: (maxSimilarity * 100).toFixed(2)
        };
    }
    return null;
};
