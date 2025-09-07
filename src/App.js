import "./App.css";
import React, { useState } from "react";

function App() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [diffResult, setDiffResult] = useState(null);
  const [diffType, setDiffType] = useState("text");

  const colorPalette = {
    primary: "#14213D",
    secondary: "#FCA311",
    light: "#E5E5E5",
    dark: "#000000",
    white: "#FFFFFF",
  };

  const handleCompare = () => {
    let result = null;
    let error = null;

    try {
      if (!input1.trim() && !input2.trim()) {
        setDiffResult(null);
        return;
      }

      if (diffType === "text") {
        const lines1 = input1.split("\n");
        const lines2 = input2.split("\n");
        result = [];

        for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
          const line1 = lines1[i] || "";
          const line2 = lines2[i] || "";

          if (line1 === line2) {
            result.push({ type: "unchanged", line: line1 });
          } else {
            if (line1 !== "") {
              result.push({ type: "removed", line: line1 });
            }
            if (line2 !== "") {
              result.push({ type: "added", line: line2 });
            }
          }
        }
      } else if (diffType === "json") {
        const json1 = input1.trim() ? JSON.parse(input1) : {};
        const json2 = input2.trim() ? JSON.parse(input2) : {};
        result = diffObjects(json1, json2);
      } else if (diffType === "headers") {
        const parseHeaders = (str) => {
          const headers = {};
          str.split("\n").forEach((line) => {
            const [key, value] = line.split(":").map((s) => s.trim());
            if (key) {
              headers[key] = value || "";
            }
          });
          return headers;
        };
        const headers1 = input1.trim() ? parseHeaders(input1) : {};
        const headers2 = input2.trim() ? parseHeaders(input2) : {};
        result = diffObjects(headers1, headers2);
      }
    } catch (e) {
      error = e.message;
    }

    if (error) {
      setDiffResult({ error });
    } else {
      setDiffResult(result);
    }
  };

  const renderDiff = () => {
  if (!diffResult) {
    return null;
  }

  if (diffResult.error) {
    return (
      <div className="bg-red-200 text-red-800 p-4 rounded-lg mt-4 font-mono whitespace-pre-wrap">
        Error: {diffResult.error}
      </div>
    );
  }

  if (diffType === "text") {
    return (
      <div className="grid grid-cols-2 gap-4 mt-4 max-h-96 overflow-auto font-mono">
        {/* Left Side - Input 1 */}
        <div className="bg-gray-800 p-4 rounded-lg text-white">
          <h3 className="font-bold mb-2 text-yellow-400">Input 1</h3>
          {diffResult.map((item, index) => (
            <div
              key={index}
              className={
                item.type === "removed"
                  ? "bg-red-600/40 text-red-300 px-2"
                  : item.type === "unchanged"
                  ? "text-gray-300 px-2"
                  : "px-2"
              }
            >
              {item.type !== "added" ? item.line : ""}
            </div>
          ))}
        </div>

        {/* Right Side - Input 2 */}
        <div className="bg-gray-800 p-4 rounded-lg text-white">
          <h3 className="font-bold mb-2 text-yellow-400">Input 2</h3>
          {diffResult.map((item, index) => (
            <div
              key={index}
              className={
                item.type === "added"
                  ? "bg-green-600/40 text-green-300 px-2"
                  : item.type === "unchanged"
                  ? "text-gray-300 px-2"
                  : "px-2"
              }
            >
              {item.type !== "removed" ? item.line : ""}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // keep JSON / headers as-is
  else if (diffType === "json" || diffType === "headers") {
    const renderObject = (obj, indent = 0) => {
      return Object.entries(obj).map(([key, value]) => {
        const padding = "  ".repeat(indent);
        const colorClass =
          value.type === "added"
            ? "text-green-400"
            : value.type === "removed"
            ? "text-red-400"
            : value.type === "changed"
            ? "text-yellow-400"
            : "";

        if (value.type === "changed" && value.nested) {
          return (
            <React.Fragment key={key}>
              <div className={`${colorClass}`}>{padding}"{key}": &#123;</div>
              {renderObject(value.nested, indent + 1)}
              <div className={`${colorClass}`}>{padding}&#125;</div>
            </React.Fragment>
          );
        } else if (value.type === "changed") {
          return (
            <div key={key} className={colorClass}>
              <span className="text-red-400">
                {padding}- "{key}": {JSON.stringify(value.from)}
              </span>
              <br />
              <span className="text-green-400">
                {padding}+ "{key}": {JSON.stringify(value.to)}
              </span>
            </div>
          );
        } else {
          const prefix =
            value.type === "added"
              ? "+"
              : value.type === "removed"
              ? "-"
              : " ";
          return (
            <div key={key} className={`${colorClass}`}>
              {padding}
              {prefix} "{key}": {JSON.stringify(value.value)}
            </div>
          );
        }
      });
    };

    return (
      <div className="bg-gray-800 p-4 rounded-lg mt-4 font-mono text-white max-h-96 overflow-auto">
        {Object.keys(diffResult).length > 0 ? (
          renderObject(diffResult)
        ) : (
          <div className="text-white text-center">No differences found.</div>
        )}
      </div>
    );
  }
};


  return (
    <div
      className="min-h-screen p-8"
      style={{ backgroundColor: colorPalette.light }}
    >
      <div className="container mx-auto max-w-7xl">
        <h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-6"
          style={{ color: colorPalette.primary }}
        >
          Difference Checker
        </h1>

        <p className="text-center text-lg md:text-xl text-gray-700 mb-6 max-w-3xl mx-auto">
          Compare <span className="font-semibold">Text, JSON</span>, or{" "}
          <span className="font-semibold">Headers</span> side by side. This tool
          highlights added, removed, or unchanged lines so you can quickly spot
          differences.
        </p>

        {/* <div className="flex justify-center mb-6">
          {['text', 'json', 'headers'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setDiffType(type);
                setDiffResult(null);
              }}
              className={`py-2 px-6 mx-2 rounded-full font-semibold transition-colors duration-200 shadow-md
                ${diffType === type
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white text-gray-800 hover:bg-yellow-100'}`
              }
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <textarea
            className="w-full p-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono shadow-inner"
            style={{ backgroundColor: colorPalette.white, minHeight: "300px" }}
            placeholder="Paste first content here..."
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          ></textarea>
          <textarea
            className="w-full p-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono shadow-inner"
            style={{ backgroundColor: colorPalette.white, minHeight: "300px" }}
            placeholder="Paste second content here..."
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleCompare}
            className="py-3 px-8 rounded-full font-bold text-lg transition-transform transform hover:scale-105 shadow-xl"
            style={{
              backgroundColor: colorPalette.secondary,
              color: colorPalette.white,
            }}
          >
            Compare
          </button>
          <button
            onClick={() => {
              setInput1("");
              setInput2("");
              setDiffResult(null);
            }}
            className="py-3 px-8 rounded-full font-bold text-lg transition-transform transform hover:scale-105 shadow-xl"
            style={{
              backgroundColor: colorPalette.primary,
              color: colorPalette.white,
            }}
          >
            Clear
          </button>
        </div>

        {diffResult &&
          (Object.keys(diffResult).length > 0 ||
          (Array.isArray(diffResult) && diffResult.length > 0) ? (
            <div className="mt-8">
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: colorPalette.primary }}
              >
                Differences
              </h2>
              {renderDiff()}
            </div>
          ) : null)}
      </div>
    </div>
  );
}

// Use a simple recursive diff function for JSON
function diffObjects(obj1, obj2) {
  const result = {};
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  for (const key of allKeys) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Added
    if (val1 === undefined) {
      result[key] = { type: "added", value: val2 };
      continue;
    }
    // Removed
    if (val2 === undefined) {
      result[key] = { type: "removed", value: val1 };
      continue;
    }

    // Different type or value
    if (typeof val1 !== typeof val2 || val1 !== val2) {
      // If both are objects, recurse
      if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        val1 !== null &&
        val2 !== null
      ) {
        const nestedDiff = diffObjects(val1, val2);
        if (Object.keys(nestedDiff).length > 0) {
          result[key] = { type: "changed", nested: nestedDiff };
        }
      } else {
        result[key] = { type: "changed", from: val1, to: val2 };
      }
    }
  }
  return result;
}

export default App;
