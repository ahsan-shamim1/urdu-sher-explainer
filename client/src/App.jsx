import { useState } from "react";
import "./App.css";

function App() {
  const [sher, setSher] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = async () => {
    const trimmed = sher.trim();
    if (!trimmed) {
      setError("براہ کرم پہلے شعر درج کریں۔");
      setExplanation("");
      return;
    }

    setLoading(true);
    setError("");
    setExplanation("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sher: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "وضاحت حاصل کرنے میں مسئلہ پیش آیا۔");
      }

      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message || "کچھ غلط ہو گیا، دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="title">اردو شعر کی وضاحت</h1>
      <p className="subtitle">
        اپنا پسندیدہ شعر (اردو یا رومن اردو میں) نیچے لکھیں اور اس کی مکمل وضاحت پائیں
      </p>

      <textarea
        className="sher-input"
        value={sher}
        onChange={(e) => setSher(e.target.value)}
        placeholder="یہاں شعر لکھیں... مثلاً: ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے"
      />

      <div className="actions">
        <button className="explain-button" onClick={handleExplain} disabled={loading}>
          وضاحت کریں
        </button>
      </div>

      {loading && (
        <div className="status-row">
          <div className="spinner" />
          <span>وضاحت تیار کی جا رہی ہے...</span>
        </div>
      )}

      {error && !loading && <div className="error-box">{error}</div>}

      {explanation && !loading && <div className="result-box">{explanation}</div>}
    </div>
  );
}

export default App;
