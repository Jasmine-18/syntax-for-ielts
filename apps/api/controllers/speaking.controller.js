// controllers/speaking.controller.js
const {ChatGoogleGenerativeAI} = require ('@langchain/google-genai');
const {PromptTemplate} = require ('@langchain/core/prompts');
const {StructuredOutputParser} = require ('@langchain/core/output_parsers');
const {z} = require ('zod'); // Used to define the schema for our output

// 1. Define the desired data structure for the output using Zod.
// This tells the parser what kind of JSON object we expect.
const parser = StructuredOutputParser.fromZodSchema (
  z.object ({
    questions: z
      .array (z.string ())
      .describe (
        'An array of 3 to 4 questions for the IELTS Speaking test Part 1 on a single topic.'
      ),
  })
);

// Initialize the model with your Google API Key
const model = new ChatGoogleGenerativeAI ({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.5-flash',
  temperature: 1.25, // Controls the randomness of the output
});

// --- Part 1: Introduction and Interview ---
module.exports.getPart1Question = async (req, res) => {
  try {
    // 2. Create a prompt template that includes the format instructions from the parser.
    // The {format_instructions} placeholder will be automatically filled with instructions
    // on how to format the response as JSON.
    const prompt = new PromptTemplate ({
      template: 'You are an IELTS examiner. Generate 3 to 4 questions for Part 1 of the IELTS Speaking test. All questions should be on a single, common topic. \n{format_instructions}\n',
      inputVariables: [],
      partialVariables: {format_instructions: parser.getFormatInstructions ()},
    });

    // 3. Create the full processing chain by piping the prompt, model, and parser together.
    const chain = prompt.pipe (model).pipe (parser);

    // 4. Invoke the chain. The parser will automatically handle the output.
    const response = await chain.invoke ({});

    // The response is now a guaranteed JavaScript object, e.g., { questions: ["...", "...", "..."] }
    res.status (200).json (response);
  } catch (error) {
    console.error ('Error generating speaking questions:', error);
    res.status (500).json ({message: 'Failed to generate speaking questions.'});
  }
};

// --- Part 2: Individual Long Turn (Cue Card) ---
const part2Parser = StructuredOutputParser.fromZodSchema (
  z.object ({
    topic: z
      .string ()
      .describe ('The main topic the candidate should describe.'),
    cue_points: z
      .array (z.string ())
      .describe (
        'An array of 3 to 4 bullet points the candidate should cover in their talk.'
      ),
  })
);

module.exports.getPart2TaskCard = async (req, res) => {
  try {
    const prompt = new PromptTemplate ({
      template: 'You are an IELTS examiner. Create a task card for Part 2 of the IELTS Speaking test. Provide a topic and 3-4 cue points the candidate should talk about.\n{format_instructions}\n',
      inputVariables: [],
      partialVariables: {
        format_instructions: part2Parser.getFormatInstructions (),
      },
    });
    // Add the built-in retry mechanism to this chain as well.
    const chain = prompt.pipe (model).pipe (part2Parser).withRetry ({
      stopAfterAttempt: 3,
    });
    const response = await chain.invoke ({});
    res.status (200).json (response);
  } catch (error) {
    console.error (
      'Error generating Part 2 task card after multiple retries:',
      error
    );
    res.status (500).json ({message: 'Failed to generate Part 2 task card.'});
  }
};

// --- Part 3: Two-way Discussion ---
const part3Parser = StructuredOutputParser.fromZodSchema (
  z.object ({
    questions: z
      .array (z.string ())
      .describe (
        'An array of 4 to 5 abstract follow-up questions related to the Part 2 topic.'
      ),
  })
);

module.exports.getPart3Questions = async (req, res) => {
  const {part2_topic} = req.body; // Expecting the topic from Part 2 in the request body

  if (!part2_topic) {
    return res.status (400).json ({
      message: 'Part 2 topic is required to generate Part 3 questions.',
    });
  }

  try {
    const prompt = new PromptTemplate ({
      template: "You are an IELTS examiner. The candidate's topic for Part 2 was '{part2_topic}'. Generate 4 to 5 abstract, discussion-style follow-up questions for Part 3 of the IELTS Speaking test.\n{format_instructions}\n",
      inputVariables: ['part2_topic'],
      partialVariables: {
        format_instructions: part3Parser.getFormatInstructions (),
      },
    });
    // Add the built-in retry mechanism here too for consistency.
    const chain = prompt.pipe (model).pipe (part3Parser).withRetry ({
      stopAfterAttempt: 3,
    });
    const response = await chain.invoke ({part2_topic: part2_topic});
    res.status (200).json (response);
  } catch (error) {
    console.error (
      'Error generating Part 3 questions after multiple retries:',
      error
    );
    res.status (500).json ({message: 'Failed to generate Part 3 questions.'});
  }
};
