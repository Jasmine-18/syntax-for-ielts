// controllers/evaluation.controller.js
const {ChatGoogleGenerativeAI} = require ('@langchain/google-genai');
const {PromptTemplate} = require ('@langchain/core/prompts');
const {StructuredOutputParser} = require ('@langchain/core/output_parsers');
const {z} = require ('zod');

// --- Model Initialization ---
const model = new ChatGoogleGenerativeAI ({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.5-flask',
  temperature: 0.5, // Lower temperature for more consistent, factual evaluation
});

// --- Evaluation Parser Definition ---
// This Zod schema defines the exact structure of the AI's evaluation report.
const evaluationParser = StructuredOutputParser.fromZodSchema (
  z.object ({
    fluency_and_coherence: z.object ({
      score: z
        .number ()
        .describe ('Estimated band score from 1-9 for Fluency and Coherence.'),
      feedback: z
        .string ()
        .describe (
          'Specific feedback and suggestions for improvement on Fluency and Coherence.'
        ),
    }),
    lexical_resource: z.object ({
      score: z
        .number ()
        .describe (
          'Estimated band score from 1-9 for Lexical Resource (Vocabulary).'
        ),
      feedback: z
        .string ()
        .describe (
          'Specific feedback and suggestions for improvement on Lexical Resource.'
        ),
    }),
    grammatical_range_and_accuracy: z.object ({
      score: z
        .number ()
        .describe (
          'Estimated band score from 1-9 for Grammatical Range and Accuracy.'
        ),
      feedback: z
        .string ()
        .describe (
          'Specific feedback and suggestions for improvement on Grammar.'
        ),
    }),
    pronunciation: z.object ({
      score: z
        .number ()
        .describe (
          'Estimated band score from 1-9 for Pronunciation, based on what can be inferred from the text.'
        ),
      feedback: z
        .string ()
        .describe (
          'Specific feedback on pronunciation aspects that can be inferred from the transcript (e.g., word choice, flow). Acknowledge the limitations of text-based analysis.'
        ),
    }),
    overall_score: z
      .number ()
      .describe (
        'The overall estimated band score, calculated as the average of the four criteria.'
      ),
    summary: z
      .string ()
      .describe (
        "A brief overall summary of the candidate's performance and key areas for focus."
      ),
  })
);

// --- Evaluation Function ---
module.exports.evaluateSpeaking = async (req, res) => {
  // Expecting an array of objects, each with a 'question' and 'answer' property.
  const {conversation} = req.body;

  if (
    !conversation ||
    !Array.isArray (conversation) ||
    conversation.length === 0
  ) {
    return res.status (400).json ({
      message: 'A valid conversation array is required for evaluation.',
    });
  }

  // Format the conversation array into a readable string for the prompt.
  const formattedConversation = conversation
    .map (turn => `Examiner: ${turn.question}\nCandidate: ${turn.answer}`)
    .join ('\n\n');

  try {
    const prompt = new PromptTemplate ({
      template: `You are a certified IELTS examiner. Your task is to evaluate a candidate's speaking test transcript and provide a detailed assessment.
      
      Analyze the following conversation based on the four official IELTS criteria: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation. Evaluate how well the candidate's answers address the questions asked.
      
      For Pronunciation, acknowledge that you are working from a transcript and can only infer aspects like rhythm and flow from the text.
      
      Provide an estimated band score (1-9) for each criterion, specific feedback with examples from the text, and suggestions for improvement. Finally, calculate the overall band score.
      
      Conversation to evaluate:
      ---
      {conversation_history}
      ---
      
      {format_instructions}
      `,
      inputVariables: ['conversation_history'],
      partialVariables: {
        format_instructions: evaluationParser.getFormatInstructions (),
      },
    });

    const chain = prompt.pipe (model).pipe (evaluationParser).withRetry ({
      stopAfterAttempt: 3,
    });

    const response = await chain.invoke ({
      conversation_history: formattedConversation,
    });
    res.status (200).json (response);
  } catch (error) {
    console.error ('Error during speaking evaluation:', error);
    res
      .status (500)
      .json ({message: 'Failed to evaluate the speaking transcript.'});
  }
};
