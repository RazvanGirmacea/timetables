import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect, useRef } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Math Test" },
    { name: "description", content: "A simple math test to practice multiplication." },
  ];
};

const generateQuestion = () => {
  let number1 = Math.floor(Math.random() * 12) + 1;
  while (number1 === 10) {
    number1 = Math.floor(Math.random() * 12) + 1;
  }
  let number2 = Math.floor(Math.random() * 12) + 1;
    while (number2 === 10) {
    number2 = Math.floor(Math.random() * 12) + 1;
  }
  return { number1, number2 };
};

export default function Index() {
  const [numQuestions, setNumQuestions] = useState(50);
  const [questions, setQuestions] = useState<
    { number1: number; number2: number }[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (testStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [testStarted]);

  const startTest = () => {
    const newQuestions = Array.from({ length: numQuestions }, () =>
      generateQuestion()
    );
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTestStarted(true);
  };

  const handleAnswer = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const answer = parseInt(event.currentTarget.value);
      setUserAnswers([...userAnswers, answer]);
      event.currentTarget.value = ""; // Clear the input
      if (currentQuestionIndex < numQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setTestStarted(false); // End the test
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    for (let i = 0; i < numQuestions; i++) {
      if (userAnswers[i] === questions[i].number1 * questions[i].number2) {
        correctAnswers++;
      }
    }
    return correctAnswers;
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <header className="flex flex-col items-center gap-2">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Math Test
          </h1>
        </header>

        <div className="flex gap-4">
          <label htmlFor="numQuestions" className="text-gray-700 dark:text-gray-200">
            Number of Questions:
          </label>
          <select
            id="numQuestions"
            className="border border-gray-300 rounded px-4 py-2 dark:bg-gray-700 dark:text-gray-200"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            disabled={testStarted}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        {!testStarted ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={startTest}
            disabled={testStarted}
          >
            Start Test
          </button>
        ) : currentQuestionIndex < numQuestions ? (
          hasMounted ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg text-gray-700 dark:text-gray-200">
                {questions[currentQuestionIndex].number1} x {questions[currentQuestionIndex].number2} = ?
              </p>
              <input
                type="number"
                ref={inputRef}
                className="border border-gray-300 rounded px-4 py-2 text-center dark:bg-gray-700 dark:text-gray-200"
                onKeyDown={handleAnswer}
              />
            </div>
          ) : null
        ) : (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Test Results
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              You got {calculateResults()} out of {numQuestions} correct!
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                setTestStarted(false);
                setUserAnswers([]);
                setCurrentQuestionIndex(0);
              }}
            >
              Start Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
