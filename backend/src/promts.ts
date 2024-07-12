import dotenv from 'dotenv';



// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { "responseMimeType": "application/json" }});
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI,
  });
export const preparedData = [
    [
      "Профессиональный разработчик",
      "@dev_pro",
      "https://www.linkedin.com/in/devpro",
      "https://github.com/devpro",
      "Назарбаев Университет",
      "Информатика",
      "EPAM",
      "1 год  опыта в разработке программного обеспечения, включая фронтенд и бэкенд разработки, облачные вычисления.",
      "Разработал несколько проектов, включая систему управления задачами и веб-приложение для бронирования отелей.",
      "Победитель хакатона по программированию, победитель олимпиады по информатике.",
      "TRUE",
      "Yes",
      "100%",
      "Good IT skills, highly motivated, impressive achievements."
    ],
    [
      "Начинающий программист",
      "@newbie_dev",
      "",
      "",
      "Казахско-британский технический университет",
      "Общие науки",
      "",
      "Закончил вводный курс по программированию.",
      "",
      "",
      "TRUE",
      "No",
      "25%",
      "Limited IT experience, unclear motivation, and no confirmation of being in Almaty, a lot of empty or meaningless fields."
    ],
    [
      "Обучаюсь программированию на курсах или самостоятельно",
      "@self_learner",
      "https://www.instagram.com/self_learner",
      "https://github.com/selflearner",
      "Онлайн курсы",
      "Веб-разработка",
      "",
      "Изучил JavaScript, React и Node.js через онлайн курсы и создал несколько личных проектов.",
      "Разработал личную блог-платформу и приложение для управления задачами.",
      "Активный участник онлайн конкурсов по программированию, завершил несколько курсов на Udemy.",
      "TRUE",
      "Yes",
      "80%",
      "Good IT background, highly motivated "
    ],
    [
      "Студент",
      "@student_dev",
      "https://www.linkedin.com/in/studentdev",
      "https://github.com/studentdev",
      "Казахский национальный университет",
      "Компьютерные науки",
      "Freelance",
      "Работал фрилансером, создавая веб-сайты и приложения.",
      "Разработал систему управления контентом для малого бизнеса.",
      "Участвовал в университетских хакатонах, занимая призовые места.",
      "TRUE",
      "Yes",
      "90%",
      "Good IT skills, highly motivated, impressive achievements."
    ],
    [
      "Школьник старше 16 лет",
      "@highschool_dev",
      "https://www.instagram.com/highschooldev",
      "",
      "РФМШ",
      "",
      "",
      "Изучаю Python и JavaScript в свободное время.",
      "Создал несколько проектов, включая чат-бота и веб-сайт для школьных мероприятий.",
      "Выиграл школьную олимпиаду по информатике.",
      "TRUE",
      "Uncertain",
      "60%",
      "Good IT skills, but motivation and availability are unclear. Flagged for mentor review. Lack of work experience."
    ],
    [
      "Студент",
      "@astanait_student",
      "https://www.linkedin.com/in/astanaitstudent",
      "https://github.com/astanaitstudent",
      "Astana IT University",
      "Программирование",
      "",
      "Изучаю программирование, специализируясь на мобильной разработке.",
      "Создал несколько мобильных приложений для учебных проектов.",
      "Участвовал в университетских соревнованиях, получил награды за лучшие проекты.",
      "TRUE",
      "Yes",
      "80%",
      "Good IT skills, impressive achievements."
    ],
    [
      "Начинающий разработчик",
      "@junior_dev",
      "https://www.linkedin.com/in/juniordev",
      "",
      "Satbayev University",
      "Информационные технологии",
      "",
      "Прошел несколько онлайн курсов по веб-разработке.",
      "Создал личный веб-сайт и несколько учебных проектов.",
      "Участвовал в учебных хакатонах и конкурсах.","TRUE",
      "Uncertain",
      "56%",
      "Good IT skills, but motivation and availability are unclear. Flagged for mentor review."
    ],
    [
      "Профессиональный разработчик",
      "@pro_dev",
      "https://www.linkedin.com/in/prodev",
      "https://github.com/prodev",
      "МУИТ",
      "Программная инженерия",
      "Kazpost, Beeline",
      "6 лет опыта в разработке программного обеспечения, специализация на бэкенд.",
      "Работал над крупными проектами, включая системы электронной коммерции и банковские приложения.",
      "Публикации в профессиональных журналах, участие в международных конференциях.",
      "FALSE",
      "No",
      "0%",
      "Not available in Almaty during the specified period."
    ],
    [
      "Студент",
      "@nu_student",
      "https://www.linkedin.com/in/nustudent",
      "https://github.com/nustudent",
      "Назарбаев Университет",
      "Информатика",
      "",
      "Работал над учебными проектами, включая разработку веб-приложений.",
      "Создал несколько приложений для управления задачами и календарями.",
      "Участвовал в университетских мероприятиях и хакатонах.",
      "TRUE",
      "Uncertain",
      "60%",
      "Good IT skills, but motivation and availability are unclear. Flagged for mentor review."
    ],
    [
      "Обучаюсь программированию на курсах или самостоятельно",
      "@autodidact_dev",
      "https://www.instagram.com/autodidactdev",
      "",
      "Нет",
      "",
      "",
      "Самостоятельно изучаю программирование через онлайн курсы и проекты.",
      "Создал несколько проектов, включая простые игры и веб-сайты.",
      "Участвую в онлайн сообществах программистов, активный участник форумов и конкурсов.",
      "TRUE",
      "Uncertain"
    ]
  ];
  

async function generateFullText(data){
  const promptFullText = `

Imagine that you are a recruiter in an IT incubator, you need to carefully select so that only those who are worthy and who are not go to the next stage. Below I will describe by what criteria it is necessary to evaluate
Criteria and priorities for evaluation:

If the candidate's availability in Almaty from June 5 to August 9, 2024 is FALSE. The decision should be NO without further evaluation.

IT Background (40%): Evaluate based on programming skills and more on past projects, and work experience.
Motivation (35%): Assess the detailed description of programming experience, impressive achievements and if he is self-taught or courses it is plus for motivation.
Activity and Openness (15%): review impressive achievements on different areas .
Education (10%): Consider the school/university by rating of organization and specialization.


Sample Input Data:

Telegram profile(doesnt matter)
Social media links(doesnt matter)
GitHub link(doesnt matter)
School/University attended(consider the rating of the organization)
Specialization in university
Work experience(if he is a student or a school student, work experience does not matter)
Detailed description of programming experience
Past programming projects
Impressive achievements (programming, education, sports, etc.)
Availability in Almaty (June 5 - August 9, 2024)(If they are not available, they should not proceed and immediately get a No decision without further evaluation)


Please return a JSON object with the following keys:
{
  "decision": "Yes", "No", or "Uncertain",
  "reason": "Good IT skills, but motivation and availability are unclear. Flagged for mentor review." // less than 15 words
}
  Yes if  more than 70%  Strong IT background, highly motivated, impressive achievements.
No if  less than 40%  Limited IT experience, unclear motivation, and no confirmation of being in Almaty, a lot of empty or meaningless fields.
Uncertain  between (40%-70%)  Good IT skills, but motivation and availability are unclear. Flagged for mentor review.


Some about incubator: The nFactorial Incubator is suitable for:
Students, university graduates, and beginner programmers.
High school students over 16 with basic programming knowledge.
Graduates of nFactorial Web and nFactorial Web Intro.
The program helps participants create a unique application to use as a portfolio for internships or jobs at top tech companies and for university applications. Technical requirements include a solid foundation in programming or knowledge equivalent to graduates of nFactorial Start or Web.

Please evaluate the following candidates for an IT incubator based on their provided data and incubator's suits.
Assess each candidate according to the specified criteria and your own objective opinion.
Return only a decision of 'Yes', 'No', or 'Uncertain' along with the score and reasoning for your decision. 


Example of evaluated candidate:
${preparedData}


Input:
${data}

`;

  try{
    console.log("Начал думать");
    
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "user", content: promptFullText}
        ],
      });

    return extractJsonFromText(response.choices[0].message.content)
  } catch(error){    
    console.log(error);
    return null
  }
}

function extractJsonFromText(text) {
  const jsonRegex = /{(?:[^{}]|(R))*}/; 
  const match = text.match(jsonRegex);

  if (match) {
    try {
      const jsonObject = JSON.parse(match[0]);
      return jsonObject;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  } else {
    console.error('No JSON object found in the text.');
    return null;
  }
}

export { extractJsonFromText };


export {generateFullText}