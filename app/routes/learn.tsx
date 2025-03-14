import { useState, useEffect } from "react";
import {
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import { init, getPerformance, updatePerformance } from "~/utils/db.server";

const generateMultiplication = () => {
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

type LoaderData = {
  initialMultiplication: { number1: number; number2: number };
  performance: { best_time: number | null; previous_best_time: number | null } | undefined;
};

export const loader: LoaderFunction = async (): Promise<Response> => {
  await init();
  const initialMultiplication = generateMultiplication();
  const performance = await getPerformance(
    initialMultiplication.number1,
    initialMultiplication.number2
  );

  const data: LoaderData = {
    initialMultiplication,
    performance,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const number1 = parseInt(formData.get("number1") as string, 10);
  const number2 = parseInt(formData.get("number2") as string, 10);
  const answer = parseInt(formData.get("answer") as string, 10);
  const time = parseInt(formData.get("time") as string, 10);
  const correctValue = number1 * number2;

  if (answer === correctValue) {
    const performance = await getPerformance(number1, number2);
    const bestTime = performance?.best_time;

    if (!bestTime || time < bestTime) {
      await updatePerformance(number1, number2, time, bestTime || null);
    }

    return json({ correct: true, number1, number2, time, bestTime });
  } else {
    return json({ correct: false, number1, number2, answer, correctValue });
  }
};

export default function LearnRoute() {
  const loaderData = useLoaderData() as LoaderData;
  const [multiplication, setMultiplication] = useState(
    loaderData.initialMultiplication
  );
  const [startTime, setStartTime] = useState(0);
  const [time, setTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [numMultiplications, setNumMultiplications] = useState(5);
  const [multiplicationCount, setMultiplicationCount] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [startedTest, setStartedTest] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (startedTest) {
      setStartTime(Date.now());
      intervalId = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    }

    return () => clearInterval(intervalId);
  }, [startedTest, startTime]);

  const handleStart = () => {
    setStartedTest(true);
    setMultiplicationCount(1);
    setResults([]);
    setMultiplication(generateMultiplication());
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append("number1", multiplication.number1.toString());
    formData.append("number2", multiplication.number2.toString());
    formData.append("time", time.toString());

    const submission = await fetch("/learn", {
      method: "POST",
      body: formData,
    });

    const resultData = await submission.json();
    setResult(resultData);
    setShowResult(true);
    setResults((prevResults) => [...prevResults, resultData]);
    setTime(0);

    if (multiplicationCount < numMultiplications) {
      setMultiplicationCount(multiplicationCount + 1);
      setMultiplication(generateMultiplication());
      setStartTime(Date.now());
    } else {
      setStartedTest(false);
    }
  };

  const handleChangeMultiplications = (event: any) => {
    setNumMultiplications(parseInt(event.target.value));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold mb-6">Timetable Challenge</h1>

      {!startedTest ? (
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            <label
              htmlFor="numMultiplications"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Number of Multiplications:
            </label>
            <select
              id="numMultiplications"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={numMultiplications}
              onChange={handleChangeMultiplications}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleStart}
          >
            Start
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">
            Question {multiplicationCount} of {numMultiplications}
          </h2>
          <p className="text-gray-700 text-center text-lg mb-4">
            What is {multiplication.number1} x {multiplication.number2}?
          </p>
          <p className="text-gray-600 text-sm italic text-center">
            Time: {(time / 1000).toFixed(2)} seconds
          </p>
          <Form method="post" onSubmit={handleSubmit} className="mb-4">
            <input
              type="number"
              name="answer"
              placeholder="Your answer"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg text-center"
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-4"
              disabled={navigation.state !== "idle"}
            >
              {navigation.state === "submitting" ? "Submitting..." : "Submit"}
            </button>
          </Form>
        </div>
      )}

      {results.length > 0 && !startedTest && (
        <div className="w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">Results</h3>
          <ul>
            {results.map((res, index) => (
              <li key={index} className="py-2 border-b border-gray-200">
                {res.correct ? (
                  <p className="text-green-600">
                    {res.number1} x {res.number2} ={" "}
                    {res.number1 * res.number2} - Time: {(res.time / 1000).toFixed(2)}s
                    {res.bestTime !== null && res.time < res.bestTime && (
                      <span className="ml-2 text-sm text-green-500">
                        (New Best Time!)
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-red-600">
                    {res.number1} x {res.number2} = {res.answer} (Correct:{" "}
                    {res.correctValue})
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
