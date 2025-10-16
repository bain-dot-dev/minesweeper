import { auth } from "@/auth";
import { Page } from "@/components/PageLayout";
import { MinesweeperGame } from "@/components/game/MinesweeperGame";
import { TopBar } from "@worldcoin/mini-apps-ui-kit-react";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Minesweeper"
          endAdornment={
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session?.user.username}
              </p>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start mb-16">
        {/* Debug info for wallet authentication */}
        {session?.user && (
          <div className="w-full max-w-md mb-4 p-4 bg-gray-100 rounded-lg text-xs">
            <h3 className="font-semibold mb-2">Authentication Info:</h3>
            <p>
              <strong>Username:</strong> {session.user.username}
            </p>
            <p>
              <strong>Verified:</strong> {session.user.verified ? "Yes" : "No"}
            </p>
            {session.user.walletAddress && (
              <p>
                <strong>Wallet:</strong>{" "}
                {session.user.walletAddress.slice(0, 6)}...
                {session.user.walletAddress.slice(-4)}
              </p>
            )}
            {session.user.profilePicture && (
              <p>
                <strong>Profile Picture:</strong> Available
              </p>
            )}
          </div>
        )}
        <MinesweeperGame />
      </Page.Main>
    </>
  );
}
