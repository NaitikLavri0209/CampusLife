import React from "react";
import ElectricBorder from "./ElectricBorder";
import LiquidEther from "./LiquidEther";

function Login({ setPage }) {
  return (
    <div className="w-full h-screen relative flex justify-center items-center bg-black">

      {/* Liquid Background — UNCHANGED */}
      <div className="absolute inset-0">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          color0="#5227FF"
          color1="#FF9FFC"
          color2="#B19EEF"
        />
      </div>

      {/* Login Content */}
      <div className="relative flex flex-col items-center text-white">

        <h2 className="text-4xl font-bold mb-8 text-[#B19EEF]">
          Login
        </h2>

        <ElectricBorder
          color="#B19EEF"
          speed={1}
          chaos={0.12}
          thickness={2}
          style={{ borderRadius: 16 }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage("loading");
            }}
            className="p-8 flex flex-col gap-6 w-80"
          >

            <div className="flex flex-col">
              <label className="mb-1 text-[#B19EEF]">Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="bg-white/10 backdrop-blur-md border border-[#B19EEF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#B19EEF] focus:ring-1 focus:ring-[#B19EEF] transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-[#B19EEF]">Password</label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                className="bg-white/10 backdrop-blur-md border border-[#B19EEF]/40 rounded px-3 py-2 text-white outline-none focus:border-[#B19EEF] focus:ring-1 focus:ring-[#B19EEF] transition"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-[#B19EEF]/20 border border-[#B19EEF] rounded py-2 hover:bg-[#B19EEF]/30 transition"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setPage("landing")}
              className="text-sm mt-2 underline text-[#B19EEF]"
            >
              Back
            </button>

          </form>
        </ElectricBorder>

      </div>
    </div>
  );
}

export default Login;
