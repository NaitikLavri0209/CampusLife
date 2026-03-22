import React, { useState, useEffect, useRef } from "react";
import Particles from "./Particles";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const GAMES = [
  {
    id: "rps",
    name: "Rock Paper Scissors",
    description: "Challenge a fellow student to a real-time Rock Paper Scissors match. First to 10 points wins!",
    image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80",
    tag: "Multiplayer",
    available: true,
  },
  {
    id: "trivia",
    name: "Campus Trivia",
    description: "Test your general knowledge with fun trivia questions. Leaderboard coming soon!",
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&q=80",
    tag: "Coming Soon",
    available: false,
  },
  {
    id: "wordle",
    name: "CampusWordle",
    description: "Guess the hidden campus-themed word in 6 tries. A daily brain workout!",
    image: "https://images.unsplash.com/photo-1632507282219-2e1c5abf8e3c?w=600&q=80",
    tag: "Coming Soon",
    available: false,
  },
  {
    id: "snake",
    name: "Snake Game",
    description: "Classic snake with a campus twist. How long can you go?",
    image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=600&q=80",
    tag: "Coming Soon",
    available: false,
  },
];

const CHOICES = ["Rock", "Paper", "Scissors"];
const EMOJI = { Rock: "🪨", Paper: "📄", Scissors: "✂️" };
const WINNING_SCORE = 10;

function getResult(mine, theirs) {
  if (mine === theirs) return "draw";
  if (
    (mine === "Rock" && theirs === "Scissors") ||
    (mine === "Paper" && theirs === "Rock") ||
    (mine === "Scissors" && theirs === "Paper")
  )
    return "win";
  return "lose";
}

function ScoreBar({ myName, opponentName, myScore, theirScore }) {
  return (
    <div className="rps-scorebar">
      <div className="rps-score-side">
        <span className="rps-score-name">{myName}</span>
        <span className="rps-score-num">{myScore}</span>
      </div>
      <div className="rps-score-divider">FIRST TO {WINNING_SCORE}</div>
      <div className="rps-score-side rps-score-side-right">
        <span className="rps-score-name">{opponentName}</span>
        <span className="rps-score-num">{theirScore}</span>
      </div>
    </div>
  );
}

function RockPaperScissors({ currentUser, onBack }) {
  const [phase, setPhase] = useState("lobby");
  const [matchId, setMatchId] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [mySlot, setMySlot] = useState(null);
  const [myChoice, setMyChoice] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  // Single source of truth for slot — always in sync before listener fires
  const mySlotRef = useRef(null);

  // ── Listener — only depends on matchId, reads slot from ref ───────────────
  useEffect(() => {
    if (!matchId) return;

    const unsub = onSnapshot(doc(db, "rpsMatches", matchId), (snap) => {
      if (!snap.exists()) {
        resetToLobby("Match was cancelled by your opponent.");
        return;
      }

      const data = snap.data();
      const slot = mySlotRef.current;

      setMatchData(data);

      // ── Opponent joined — move searching → playing ─────────────────────
      if (data.status === "playing" && data.player1 && data.player2) {
        setPhase((prev) => {
          if (prev === "searching" || prev === "lobby") return "playing";
          return prev;
        });
      }

      // ── Both choices submitted — show round result ─────────────────────
      if (data.choice1 && data.choice2) {
        const mine = slot === "player1" ? data.choice1 : data.choice2;
        const theirs = slot === "player1" ? data.choice2 : data.choice1;
        const res = getResult(mine, theirs);
        setRoundResult(res);
        setPhase("roundover");
        return;
      }

      // ── Choices cleared by player1 — start next round ──────────────────
      if (data.choice1 === null && data.choice2 === null) {
        if (data.score1 >= WINNING_SCORE || data.score2 >= WINNING_SCORE) {
          setPhase("gameover");
          return;
        }
        setMyChoice(null);
        setRoundResult(null);
        setPhase((prev) =>
          prev === "roundover" || prev === "waitingNextRound" || prev === "playing"
            ? "playing"
            : prev
        );
      }
    });

    return () => unsub();
  }, [matchId]);

  const resetToLobby = (msg = "") => {
    setPhase("lobby");
    setMatchId(null);
    setMatchData(null);
    setMySlot(null);
    mySlotRef.current = null;
    setMyChoice(null);
    setRoundResult(null);
    setStatusMsg(msg);
  };

  // ── Find or create match ───────────────────────────────────────────────────
  const handleSearchMatch = async () => {
    setPhase("searching");
    setStatusMsg("Searching for an opponent...");

    try {
      const q = query(
        collection(db, "rpsMatches"),
        where("status", "==", "waiting")
      );
      const snapshot = await getDocs(q);
      const available = snapshot.docs.filter(
        (d) => d.data().player1Id !== currentUser.uid
      );

      if (available.length > 0) {
        // ── Join as player2 ──────────────────────────────────────────────
        // CRITICAL: set ref before setMatchId so listener has slot on first fire
        mySlotRef.current = "player2";
        setMySlot("player2");

        const matchDoc = available[0];
        await updateDoc(doc(db, "rpsMatches", matchDoc.id), {
          player2: currentUser.name,
          player2Id: currentUser.uid,
          status: "playing",
        });

        setPhase("playing");
        setStatusMsg("");
        setMatchId(matchDoc.id); // set last — triggers listener after ref is ready

      } else {
        // ── Create as player1 ────────────────────────────────────────────
        mySlotRef.current = "player1";
        setMySlot("player1");

        const newMatch = await addDoc(collection(db, "rpsMatches"), {
          player1: currentUser.name,
          player1Id: currentUser.uid,
          player2: null,
          player2Id: null,
          choice1: null,
          choice2: null,
          score1: 0,
          score2: 0,
          status: "waiting",
          createdAt: Date.now(),
        });

        setStatusMsg("Waiting for an opponent to join...");
        setMatchId(newMatch.id); // set last — triggers listener after ref is ready
      }
    } catch (err) {
      console.error("Matchmaking error:", err);
      setPhase("lobby");
      setStatusMsg("Something went wrong. Please try again.");
    }
  };

  // ── Submit choice ──────────────────────────────────────────────────────────
  const handleChoice = async (choice) => {
    if (!matchId || myChoice) return;
    setMyChoice(choice);
    const field = mySlotRef.current === "player1" ? "choice1" : "choice2";
    await updateDoc(doc(db, "rpsMatches", matchId), { [field]: choice });
  };

  // ── Next round ─────────────────────────────────────────────────────────────
  // Player1 writes scores + clears choices → listener picks it up for both players
  // Player2 just waits — listener detects null choices and moves to playing
  const handleNextRound = async () => {
    if (!matchId || !matchData) return;

    if (mySlotRef.current === "player1") {
      const res = getResult(matchData.choice1, matchData.choice2);
      const newScore1 = matchData.score1 + (res === "win" ? 1 : 0);
      const newScore2 = matchData.score2 + (res === "lose" ? 1 : 0);

      await updateDoc(doc(db, "rpsMatches", matchId), {
        choice1: null,
        choice2: null,
        score1: newScore1,
        score2: newScore2,
      });
      // listener handles phase transition for both players
    } else {
      // Player2 shows local waiting screen; listener will flip to playing
      setPhase("waitingNextRound");
    }
  };

  // ── Leave match ────────────────────────────────────────────────────────────
  const handleLeave = async () => {
    if (matchId) {
      try { await deleteDoc(doc(db, "rpsMatches", matchId)); } catch (_) {}
    }
    resetToLobby();
  };

  // ── Derived display values ─────────────────────────────────────────────────
  const myScore = matchData
    ? mySlot === "player1" ? matchData.score1 : matchData.score2
    : 0;
  const theirScore = matchData
    ? mySlot === "player1" ? matchData.score2 : matchData.score1
    : 0;
  const opponentName =
    mySlot === "player1"
      ? matchData?.player2 || "Opponent"
      : matchData?.player1 || "Opponent";
  const myChoiceFinal = mySlot === "player1" ? matchData?.choice1 : matchData?.choice2;
  const theirChoiceFinal = mySlot === "player1" ? matchData?.choice2 : matchData?.choice1;
  const iWon = phase === "gameover" && myScore >= WINNING_SCORE;

  return (
    <div className="rps-root">

      {/* Header */}
      <div className="rps-header">
        <button
          className="rps-back-btn"
          onClick={phase === "lobby" ? onBack : handleLeave}
        >
          ← {phase === "lobby" ? "Back to Arcade" : "Leave Match"}
        </button>
        <h2 className="rps-title">Rock Paper Scissors</h2>
        <span className="rps-subtitle">First to {WINNING_SCORE} points wins</span>
      </div>

      {/* LOBBY */}
      {phase === "lobby" && (
        <div className="rps-lobby">
          {statusMsg && <p className="rps-status-msg">{statusMsg}</p>}
          <div className="rps-lobby-emojis">🪨 📄 ✂️</div>
          <h3 className="rps-lobby-heading">Challenge a Campus Mate</h3>
          <p className="rps-lobby-desc">
            Get matched with another student in real-time.
            First to reach <strong>{WINNING_SCORE} points</strong> wins!
          </p>
          <button className="rps-find-btn" onClick={handleSearchMatch}>
            Find Opponent
          </button>
        </div>
      )}

      {/* SEARCHING */}
      {phase === "searching" && (
        <div className="rps-waiting">
          <div className="rps-spinner" />
          <p className="rps-waiting-msg">{statusMsg}</p>
          <button className="rps-cancel-btn" onClick={handleLeave}>
            Cancel
          </button>
        </div>
      )}

      {/* PLAYING */}
      {phase === "playing" && (
        <div className="rps-playing">
          <ScoreBar
            myName={currentUser.name}
            opponentName={opponentName}
            myScore={myScore}
            theirScore={theirScore}
          />
          <div className="rps-vs-banner">
            <span className="rps-player-name">{currentUser.name}</span>
            <span className="rps-vs">VS</span>
            <span className="rps-player-name">{opponentName}</span>
          </div>
          {!myChoice ? (
            <>
              <p className="rps-choose-prompt">Make your move!</p>
              <div className="rps-choices">
                {CHOICES.map((c) => (
                  <button
                    key={c}
                    className="rps-choice-btn"
                    onClick={() => handleChoice(c)}
                  >
                    <span className="rps-choice-emoji">{EMOJI[c]}</span>
                    <span className="rps-choice-label">{c}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="rps-waiting-move">
              <p className="rps-chose-text">
                You chose {EMOJI[myChoice]} <strong>{myChoice}</strong>
              </p>
              <div className="rps-spinner" />
              <p className="rps-waiting-msg">
                Waiting for {opponentName} to choose...
              </p>
            </div>
          )}
        </div>
      )}

      {/* WAITING NEXT ROUND — player2 only */}
      {phase === "waitingNextRound" && (
        <div className="rps-waiting">
          <ScoreBar
            myName={currentUser.name}
            opponentName={opponentName}
            myScore={myScore}
            theirScore={theirScore}
          />
          <div className="rps-spinner" />
          <p className="rps-waiting-msg">Waiting for next round...</p>
        </div>
      )}

      {/* ROUND OVER */}
      {phase === "roundover" && (
        <div className="rps-result">
          <ScoreBar
            myName={currentUser.name}
            opponentName={opponentName}
            myScore={myScore}
            theirScore={theirScore}
          />
          <div className="rps-result-moves">
            <div className="rps-result-side">
              <p className="rps-result-label">You</p>
              <span className="rps-result-emoji">{EMOJI[myChoiceFinal]}</span>
              <p className="rps-result-choice">{myChoiceFinal}</p>
            </div>
            <span className="rps-result-vs">VS</span>
            <div className="rps-result-side">
              <p className="rps-result-label">{opponentName}</p>
              <span className="rps-result-emoji">{EMOJI[theirChoiceFinal]}</span>
              <p className="rps-result-choice">{theirChoiceFinal}</p>
            </div>
          </div>
          <div className={`rps-result-banner rps-result-${roundResult}`}>
            {roundResult === "win" && "✅ Round Won! +1"}
            {roundResult === "lose" && "❌ Round Lost!"}
            {roundResult === "draw" && "🤝 Draw! No point"}
          </div>
          <button className="rps-find-btn" onClick={handleNextRound}>
            Next Round →
          </button>
        </div>
      )}

      {/* GAME OVER */}
      {phase === "gameover" && (
        <div className="rps-result">
          <ScoreBar
            myName={currentUser.name}
            opponentName={opponentName}
            myScore={myScore}
            theirScore={theirScore}
          />
          <div
            className={`rps-result-banner ${iWon ? "rps-result-win" : "rps-result-lose"}`}
            style={{ fontSize: "32px", padding: "24px 48px" }}
          >
            {iWon ? "🏆 You Won the Match!" : "💀 You Lost the Match!"}
          </div>
          <p style={{ opacity: 0.6, fontSize: "15px" }}>
            Final Score — {currentUser.name}: {myScore} | {opponentName}: {theirScore}
          </p>
          <div className="rps-result-actions">
            <button className="rps-find-btn" onClick={handleLeave}>
              Play Again
            </button>
            <button className="rps-cancel-btn" onClick={onBack}>
              Back to Arcade
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main CampusArcade ──────────────────────────────────────────────────────────
function CampusArcade({ setPage, currentUser }) {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === "rps") {
    return (
      <RockPaperScissors
        currentUser={currentUser}
        onBack={() => setActiveGame(null)}
      />
    );
  }

  return (
    <div className="arcade-root">
      <div className="arcade-particles">
        <Particles particleColors={["#ffffff"]} particleCount={120} speed={0.3} />
      </div>
      <div className="arcade-page">
        <div className="arcade-navbar">
          <div>
            <h2 className="arcade-navbar-title">CAMPUS ARCADE</h2>
            <small className="arcade-navbar-sub">Play with your campus community</small>
          </div>
          <button className="arcade-back-btn" onClick={() => setPage("home")}>
            Back to Dashboard
          </button>
        </div>
        <div className="arcade-grid">
          {GAMES.map((game) => (
            <div key={game.id} className="arcade-card">
              <div className="arcade-card-img-wrap">
                <img src={game.image} alt={game.name} className="arcade-card-img" />
                <span
                  className={`arcade-tag ${
                    game.available ? "arcade-tag-live" : "arcade-tag-soon"
                  }`}
                >
                  {game.tag}
                </span>
              </div>
              <div className="arcade-card-body">
                <h3 className="arcade-card-title">{game.name}</h3>
                <p className="arcade-card-desc">{game.description}</p>
                <button
                  className={`arcade-play-btn ${
                    !game.available ? "arcade-play-btn-disabled" : ""
                  }`}
                  disabled={!game.available}
                  onClick={() => game.available && setActiveGame(game.id)}
                >
                  {game.available ? "▶ Play Now" : "Coming Soon"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CampusArcade;