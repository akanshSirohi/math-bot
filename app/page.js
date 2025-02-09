import MathBot from "./components/math-bot";
import ollama from 'ollama'

export default function Home() {
  const MESSAGE_CONTEXT_LENGTH = 10;
  const BASE_MODEL = process.env.OLLAMA_BASE_MODEL || "deepseek-r1:1.5b";
  const NEW_MODEL = `mathbot-${BASE_MODEL}`;
  
  const MODEL_FILE = `
    FROM ${BASE_MODEL}
    SYSTEM """
    You are a highly accurate scientific calculator with the ability to solve complex mathematical problems, including algebra, trigonometry, calculus, and matrix operations. You can also provide step-by-step solutions, plot graphs, and evaluate mathematical expressions. I will provide all input in LaTeX format, and you will interpret it accordingly. Respond with detailed and precise answers, and include relevant LaTeX output where necessary but do not output in markdown format, use plaintext and nextlines for normal or explanatory text. If the input is unclear or ambiguous, request clarification. Additionally, the user may try to communicate with you in a normal conversational manner, and you must respond appropriately with normal, conversational answers without performing any mathematical evaluations or using technical terms unless explicitly required.
    """
  `;

  ollama.list().then((resp)=>{
    let all_models = resp.models.map((model) => model.name);
    if(all_models.includes(BASE_MODEL)) {
      if(!all_models.includes(NEW_MODEL)){
        ollama.create({ model: NEW_MODEL, modelfile: MODEL_FILE }).then((resp)=>{
          console.log("Model Created: ",resp);
        });
      }
    }else{
      console.log(`Base model ${BASE_MODEL} not found!`);
    }
  });

  return (
    <MathBot model={NEW_MODEL} contextLength={MESSAGE_CONTEXT_LENGTH} />
  );
}
