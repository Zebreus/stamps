import { css } from "@emotion/react"

export const GithubRibbon = () => {
  return (
    <div
      css={css`
        background-color: #a00;
        overflow: hidden;
        white-space: nowrap;
        position: fixed;
        right: -50px;
        top: 40px;
        transform: rotate(45deg);
        box-shadow: 0 0 10px #888;
      `}
    >
      <a
        href="https://github.com/zebreus/stamps"
        css={css`
          border: 1px solid #faa;
          color: #fff;
          display: block;
          font: bold 81.25% "Helvetica Neue", Helvetica, Arial, sans-serif;
          margin: 1px 0;
          padding: 10px 50px;
          text-align: center;
          text-decoration: none;
          text-shadow: 0 0 5px #444;
        `}
      >
        Fork me on GitHub
      </a>
    </div>
  )
}
