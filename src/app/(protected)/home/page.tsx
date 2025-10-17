import { auth } from "@/auth";
import { Page } from "@/components/PageLayout";
import { MinesweeperGame } from "@/components/game/MinesweeperGame";
import { Sparks, CheckCircle } from "iconoir-react";

export default async function Home() {
  const session = await auth();
  console.log("🏠 Home page session:", session);

  return (
    <>
      <Page.Header className="p-0 bg-gradient-to-r from-mi-black via-mi-black/95 to-mi-black border-b-2 border-mi-red shadow-lg shadow-mi-red/20">
        <div className="flex items-center justify-between px-4 py-3 relative overflow-hidden">
          {/* Scanning line animation */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-mi-cyber-green animate-scan opacity-50"></div>

          {/* Mission Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparks className="w-8 h-8 text-mi-red animate-pulse" />
              <div className="absolute inset-0 w-8 h-8 text-mi-red opacity-30 animate-ping"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-mi-cyber-green uppercase tracking-wider font-mono">
                Minesweeper
              </h1>
              <p className="text-[10px] text-mi-yellow/70 uppercase tracking-widest">
                Mission Control
              </p>
            </div>
          </div>

          {/* Agent Status */}
          <div className="flex items-center gap-3 bg-mi-black/60 backdrop-blur-sm border border-mi-electric-blue/30 rounded-lg px-3 py-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-mi-electric-blue/70 uppercase tracking-wider">
                Agent
              </span>
              <p className="text-sm font-bold text-mi-cyber-green capitalize font-mono">
                {session?.user.username}
              </p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-mi-cyber-green to-mi-electric-blue rounded-full flex items-center justify-center border-2 border-mi-cyber-green/50 shadow-lg shadow-mi-cyber-green/30">
                <CheckCircle className="w-5 h-5 text-mi-black" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-mi-cyber-green rounded-full animate-pulse border border-mi-black"></div>
            </div>
          </div>
        </div>
      </Page.Header>
      <Page.Main className="flex flex-col overflow-hidden bg-gradient-to-b from-mi-black via-mi-black/98 to-mi-black p-0">
        <div className="flex-1 overflow-y-auto flex flex-col items-center pt-6">
          {/* Agent Intel Panel */}
          {session?.user && (
            <div className="w-full max-w-md mb-6 px-4">
              <div className="p-4 bg-gradient-to-br from-mi-black/90 to-mi-black/70 rounded-lg border border-mi-electric-blue/30 shadow-lg shadow-mi-electric-blue/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-mi-cyber-green to-transparent opacity-50"></div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-mi-cyber-green rounded-full animate-pulse"></div>
                  <h3 className="text-xs font-bold text-mi-electric-blue uppercase tracking-widest font-mono">
                    Agent Intel
                  </h3>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between py-1.5 border-b border-mi-red/20">
                    <span className="text-mi-yellow/70 uppercase tracking-wide">Codename:</span>
                    <span className="text-mi-cyber-green font-bold">{session.user.username}</span>
                  </div>

                  {session.user.walletAddress && (
                    <div className="flex items-center justify-between py-1.5 border-b border-mi-red/20">
                      <span className="text-mi-yellow/70 uppercase tracking-wide">Wallet ID:</span>
                      <span className="text-mi-electric-blue font-bold">
                        {session.user.walletAddress.slice(0, 6)}...
                        {session.user.walletAddress.slice(-4)}
                      </span>
                    </div>
                  )}

                  {session.user.profilePictureUrl && (
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-mi-yellow/70 uppercase tracking-wide">Profile:</span>
                      <span className="text-mi-cyber-green font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-mi-cyber-green rounded-full"></span>
                        Verified
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <MinesweeperGame />
        </div>
      </Page.Main>
    </>
  );
}
