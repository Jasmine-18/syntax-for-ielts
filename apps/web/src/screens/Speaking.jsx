import React, {useState, useEffect, useRef} from 'react';

// --- Constants ---
const API_BASE_URL = 'http://localhost:3000/api'; // Ensure this matches your backend server address
const FULL_DASH_ARRAY = 283; // For the timer circle animation

// --- Helper Components ---

const Timer = ({duration, timeLeft}) => {
  const dashOffset = duration > 0
    ? FULL_DASH_ARRAY - timeLeft / duration * FULL_DASH_ARRAY
    : FULL_DASH_ARRAY;
  const minutes = Math.floor (timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative w-48 h-48 mx-auto mb-6">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className="text-blue-600 transition-all duration-1000 linear"
          style={{
            strokeDasharray: FULL_DASH_ARRAY,
            strokeDashoffset: dashOffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
        {`${minutes}:${seconds.toString ().padStart (2, '0')}`}
      </div>
    </div>
  );
};

const CueCard = ({topic, points}) => (
  <div className="my-4 p-6 bg-gray-50 border border-gray-200 rounded-lg text-left">
    <h3 className="text-xl font-bold mb-3">{topic}</h3>
    <ul className="list-disc list-inside space-y-2">
      {points.map ((point, index) => <li key={index}>{point}</li>)}
    </ul>
  </div>
);

const EvaluationReport = ({data}) => {
  if (!data) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (data.error) {
    return <p className="text-red-500 text-center">{data.error}</p>;
  }

  const {
    fluency_and_coherence,
    lexical_resource,
    grammatical_range_and_accuracy,
    pronunciation,
    overall_score,
    summary,
  } = data;

  const createSection = (title, score, feedback) => (
    <div className="border-b pb-4" key={title}>
      <div className="flex justify-between items-baseline">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <span className="text-2xl font-bold text-blue-600">
          {score.toFixed (1)}
        </span>
      </div>
      <p className="mt-2 text-gray-600">{feedback}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-500">
          Overall Band Score
        </h3>
        <p className="text-7xl font-bold text-blue-600 my-2">
          {overall_score.toFixed (1)}
        </p>
        <p className="text-gray-700">{summary}</p>
      </div>
      {createSection (
        'Fluency and Coherence',
        fluency_and_coherence.score,
        fluency_and_coherence.feedback
      )}
      {createSection (
        'Lexical Resource',
        lexical_resource.score,
        lexical_resource.feedback
      )}
      {createSection (
        'Grammatical Range and Accuracy',
        grammatical_range_and_accuracy.score,
        grammatical_range_and_accuracy.feedback
      )}
      {createSection (
        'Pronunciation',
        pronunciation.score,
        pronunciation.feedback
      )}
    </div>
  );
};

const LoadingSpinner = ({message}) => (
  <div className="flex flex-col justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

// --- Main App Component ---

export default function App () {
  const [testState, setTestState] = useState ('start'); // 'start', 'running', 'finished'
  const [isLoading, setIsLoading] = useState (false);
  const [isRecording, setIsRecording] = useState (false);
  const [isProcessing, setIsProcessing] = useState (false);
  const [status, setStatus] = useState ({title: '', instruction: ''});
  const [currentPart, setCurrentPart] = useState (1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState (0);
  const [testData, setTestData] = useState ({});
  const [conversationHistory, setConversationHistory] = useState ([]);
  const [evaluation, setEvaluation] = useState (null);
  const [timer, setTimer] = useState ({duration: 0, timeLeft: 0});
  const [liveTranscript, setLiveTranscript] = useState ('');

  const mediaRecorderRef = useRef (null);
  const audioStreamRef = useRef (null);
  const speechRecognitionRef = useRef (null);
  const finalTranscriptRef = useRef ('');
  const timerIntervalRef = useRef (null);
  const questionAskedRef = useRef (false);

  // --- Core Test Logic ---

  const startTest = () => {
    setTestState ('running');
    runPart1 ();
  };

  const continueTestFlow = updatedHistory => {
    questionAskedRef.current = false;
    if (currentPart === 1) {
      if (currentQuestionIndex < testData.part1.questions.length - 1) {
        setCurrentQuestionIndex (currentQuestionIndex + 1);
      } else {
        runPart2 ();
      }
    } else if (currentPart === 2) {
      runPart3 ();
      finishTest (updatedHistory);
    } else if (currentPart === 3) {
      if (currentQuestionIndex < testData.part3.questions.length - 1) {
        setCurrentQuestionIndex (currentQuestionIndex + 1);
      } else {
        finishTest (updatedHistory);
      }
    }
  };

  const finishTest = async finalHistory => {
    setStatus ({
      title: 'Test Complete',
      instruction: 'Please wait while we generate your evaluation.',
    });
    setTestState ('finished');
    try {
      const evalData = await submitForEvaluation (finalHistory);
      setEvaluation (evalData);
    } catch (error) {
      console.error ('Evaluation failed:', error);
      setEvaluation ({
        error: 'Sorry, an error occurred while generating your report.',
      });
    }
  };

  // --- Part-Specific Logic ---

  const runPart1 = async () => {
    setCurrentPart (1);
    setStatus ({
      title: 'Part 1: Introduction',
      instruction: 'The examiner will ask some general questions.',
    });
    const data = await fetchApi ('/speaking/part1');
    if (data && data.questions) {
      setTestData (prev => ({...prev, part1: data}));
      setCurrentQuestionIndex (0);
    }
  };

  const runPart2 = async () => {
    setCurrentPart (2);
    setStatus ({
      title: 'Part 2: Cue Card',
      instruction: 'You will be given a topic to talk about.',
    });
    const data = await fetchApi ('/speaking/part2');
    if (data) {
      setTestData (prev => ({...prev, part2: data}));
    }
  };

  const runPart3 = async () => {
    console.log ('Running Part 3');
    setCurrentPart (3);
    setStatus ({
      title: 'Part 3: Discussion',
      instruction: 'The examiner will ask some follow-up questions.',
    });
    const data = await fetchApi ('/speaking/part3', {
      part2_topic: testData.part2.topic,
    });
    if (data && data.questions) {
      setTestData (prev => ({...prev, part3: data}));
      setCurrentQuestionIndex (0);
    }
  };

  // --- Effects for running the test flow ---

  useEffect (
    () => {
      console.log ('this code is running 1', currentPart, currentQuestionIndex);
      if (
        testState === 'running' &&
        currentPart === 1 &&
        testData.part1 &&
        !questionAskedRef.current
      ) {
        questionAskedRef.current = true;
        console.log (
          'this code is running 2',
          testData.part1.questions[currentQuestionIndex]
        );
        askQuestion (testData.part1.questions[currentQuestionIndex], 60);
      }
    },
    [testState, currentPart, testData.part1, currentQuestionIndex]
  );

  useEffect (
    () => {
      if (
        testState === 'running' &&
        currentPart === 2 &&
        testData.part2 &&
        !questionAskedRef.current
      ) {
        questionAskedRef.current = true;
        console.log ("I'mmhere");
        startPreparation ();
      }
    },
    [testState, currentPart, testData.part2]
  );

  useEffect (
    () => {
      if (
        testState === 'running' &&
        currentPart === 3 &&
        testData.part3 &&
        !questionAskedRef.current
      ) {
        questionAskedRef.current = true;
        askQuestion (testData.part3.questions[currentQuestionIndex], 60);
      }
    },
    [testState, currentPart, testData.part3, currentQuestionIndex]
  );

  // --- Action Functions ---

  const askQuestion = (questionText, duration) => {
    setConversationHistory (prev => [
      ...prev,
      {question: questionText, answer: ''},
    ]);
    setStatus ({
      title: 'Listening...',
      instruction: 'Pay attention to the question.',
    });
    speak (questionText, () => startRecording (duration));
  };

  const startPreparation = () => {
    setStatus ({
      title: 'Prepare your talk',
      instruction: 'You have 1 minute to prepare your notes.',
    });
    runTimer (60, () => {
      const questionText = `Please ${testData.part2.topic}`;
      setConversationHistory (prev => [
        ...prev,
        {question: questionText, answer: ''},
      ]);
      speak (questionText, () => startRecording (120));
    });
  };

  const startRecording = async duration => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia ({audio: true});
      audioStreamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder (stream);

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognitionRef.current = new SpeechRecognition ();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        finalTranscriptRef.current = '';
        setLiveTranscript ('');

        speechRecognitionRef.current.onresult = event => {
          let interimTranscript = '';
          // We start the loop from event.resultIndex to process only new results.
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              // Append new final results to the ref, which persists across events.
              finalTranscriptRef.current += event.results[i][0].transcript;
            } else {
              // The interim part is always the last, non-final result.
              interimTranscript += event.results[i][0].transcript;
            }
          }
          // Update the screen to show the complete final transcript plus the live interim part.
          setLiveTranscript (finalTranscriptRef.current + interimTranscript);
        };

        speechRecognitionRef.current.onend = () => {
          const finalAnswer =
            finalTranscriptRef.current ||
            liveTranscript ||
            'Could not transcribe audio.';

          setConversationHistory (prevHistory => {
            const updatedHistory = [...prevHistory];
            console.log (`updatedHistory`, updatedHistory);
            if (updatedHistory.length > 0) {
              updatedHistory[updatedHistory.length - 1].answer = finalAnswer;
            }
            console.log (
              `Question: "${updatedHistory[updatedHistory.length - 1].question}"\nAnswer: "${finalAnswer}"`
            );

            setIsProcessing (false);
            continueTestFlow (updatedHistory);
            return updatedHistory;
          });
        };
      }

      mediaRecorderRef.current.onstop = () => {
        setIsRecording (false);
        setIsProcessing (true);

        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop ();
        }

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks ().forEach (track => track.stop ());
          audioStreamRef.current = null;
        }
      };

      setStatus ({
        title: 'Recording...',
        instruction: `You have ${duration} seconds to answer.`,
      });
      setIsRecording (true);
      mediaRecorderRef.current.start ();
      speechRecognitionRef.current.start ();
      runTimer (duration, handleStopRecording);
    } catch (err) {
      console.error (
        'Microphone access denied or speech recognition error:',
        err
      );
      alert (
        'This test requires microphone access. Please allow access and try again.'
      );
      setTestState ('start');
    }
  };

  const handleStopRecording = () => {
    clearInterval (timerIntervalRef.current);
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop ();
    }
  };

  // --- Helper Functions ---

  const runTimer = (duration, onEndCallback) => {
    clearInterval (timerIntervalRef.current);
    setTimer ({duration, timeLeft: duration});

    timerIntervalRef.current = setInterval (() => {
      setTimer (prev => {
        if (prev.timeLeft <= 1) {
          clearInterval (timerIntervalRef.current);
          onEndCallback ();
          return {...prev, timeLeft: 0};
        }
        return {...prev, timeLeft: prev.timeLeft - 1};
      });
    }, 1000);
  };

  const speak = (text, onEndCallback) => {
    window.speechSynthesis.cancel ();
    const utterance = new SpeechSynthesisUtterance (text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = onEndCallback;
    window.speechSynthesis.speak (utterance);
  };

  const fetchApi = async (endpoint, body = null) => {
    setIsLoading (true);
    try {
      const options = {
        method: body ? 'POST' : 'GET',
        headers: {'Content-Type': 'application/json'},
        body: body ? JSON.stringify (body) : null,
      };
      const response = await fetch (`${API_BASE_URL}${endpoint}`, options);
      if (!response.ok)
        throw new Error (`HTTP error! status: ${response.status}`);
      return await response.json ();
    } catch (error) {
      console.error (`Failed to fetch from ${endpoint}:`, error);
      alert (
        `Error: Could not load data for the test. Please ensure the backend server is running.`
      );
      return null;
    } finally {
      setIsLoading (false);
    }
  };

  const submitForEvaluation = async historyToSubmit => {
    return await fetchApi ('/evaluate/speaking', {
      conversation: historyToSubmit,
    });
  };

  return (
    <div className="bg-gray-100 w-screen min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 text-center">
        {isLoading
          ? <LoadingSpinner message={`Loading Part ${currentPart} Test...`} />
          : isProcessing
              ? <LoadingSpinner message="Processing your answer..." />
              : <div>
                  {testState === 'start' &&
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        IELTS Speaking Test
                      </h1>
                      <p className="mt-4 text-gray-600">
                        This is a full simulation of the IELTS speaking test. Please ensure you are in a quiet environment.
                      </p>
                      <button
                        onClick={startTest}
                        className="mt-8 bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-xl hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      >
                        Start Test
                      </button>
                    </div>}

                  {testState === 'running' &&
                    <div>
                      {(isRecording || currentPart == 2) &&
                        <Timer
                          duration={timer.duration}
                          timeLeft={timer.timeLeft}
                        />}
                      <h2 className="text-2xl font-semibold text-gray-700">
                        {status.title}
                      </h2>
                      <p className="mt-2 text-gray-500">{status.instruction}</p>

                      {isRecording &&
                        <div className="mt-6">
                          <div className="flex items-center justify-center text-red-500">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
                            <span>Recording...</span>
                          </div>
                          <p className="text-gray-500 min-h-[2.5rem] mt-2 italic">
                            {liveTranscript}
                          </p>
                          <button
                            onClick={handleStopRecording}
                            className="mt-4 bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
                          >
                            Stop Recording
                          </button>
                        </div>}

                      {currentPart === 2 &&
                        testData.part2 &&
                        !isRecording &&
                        <CueCard
                          topic={testData.part2.topic}
                          points={testData.part2.cue_points}
                        />}
                    </div>}

                  {testState === 'finished' &&
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-700">
                        {status.title}
                      </h2>
                      <p className="mt-2 text-gray-500">{status.instruction}</p>
                    </div>}
                </div>}
      </div>

      {testState === 'finished' &&
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Evaluation Report
              </h2>
              <button
                onClick={() => window.location.reload ()}
                className="text-gray-500 hover:text-gray-800 text-3xl leading-none"
              >
                &times;
              </button>
            </div>
            <EvaluationReport data={evaluation} />
          </div>
        </div>}
    </div>
  );
}
