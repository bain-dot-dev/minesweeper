// import { auth } from "@/auth";
import { Page } from "@/components/PageLayout";
import { MinesweeperGame } from "@/components/game/MinesweeperGame";
// import { TopBar } from "@worldcoin/mini-apps-ui-kit-react";

export default async function Home() {
  // const session = await auth();

  return (
    <>
      {/* <Page.Header className="p-0">
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
      </Page.Header> */}
      <Page.Main className="flex flex-col items-center justify-start mb-16">
        <MinesweeperGame />
      </Page.Main>
    </>
  );
}
