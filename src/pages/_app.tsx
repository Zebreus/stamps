import { GithubRibbon } from "components/GithubRibbon"
import type { AppProps } from "next/app"
// eslint-disable-next-line import/no-unassigned-import
import "styles/global.css"

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GithubRibbon />
      <Component {...pageProps} />
    </>
  )
}
