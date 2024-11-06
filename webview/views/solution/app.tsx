const { default: React, useState, useEffect } = await import('react');
const { VSCodeButton, VSCodeProgressRing } = await import(
  '@vscode/webview-ui-toolkit/react'
);
const { FontAwesomeIcon } = await import('@fortawesome/react-fontawesome');
const { faThumbsDown, faThumbsUp } = await import(
  '@fortawesome/free-solid-svg-icons'
);
const { default: send } = await import('@w/webviewRequest');
const { UserIcon, UserName } = await import('@w/utils');
const { default: Md } = await import('@w/markdownViewer');
import '@w/common.css';
import './app.css';
import { formatDate } from '@/utils/stringUtils';
import type ArticleData from '@/model/article';

export default function App({ total }: { total: number }) {
  const [index, setIndex] = useState(0);
  return <SolutionPage index={index} setIndex={setIndex} total={total} />;
}

function SolutionPage({
  index,
  setIndex,
  total
}: {
  index: number;
  setIndex: (index: number) => void;
  total: number;
}) {
  const [article, setArticle] = useState<ArticleData | undefined | false>(
    undefined
  );
  function fetchData(ignore: () => boolean) {
    setArticle(undefined);
    send('getSolutionDetails', { index }).then(
      v => {
        if (ignore()) return;
        setArticle(v);
      },
      () => setArticle(false)
    );
  }
  useEffect(() => {
    let ignore = false;
    fetchData(() => ignore);
    return () => void (ignore = true);
  }, [index]);
  return (
    <>
      {typeof article === 'object' ? (
        <div>
          <div>
            <span>
              <UserIcon url={article.author.icon} uid={article.author.uid} />
              <UserName user={article.author} />
              {'@ '}
              {formatDate(article.createTime)}
            </span>
            <span>
              文章 ID：
              <a href={'https://www.luogu.com/article/' + article.lid}>
                {article.lid}
              </a>
            </span>
          </div>
          <Md>{article.content}</Md>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {article === undefined ? (
            <VSCodeProgressRing />
          ) : (
            <>
              <VSCodeButton
                appearance="primary"
                onClick={() => fetchData(() => false)}
              >
                重试
              </VSCodeButton>
            </>
          )}
        </div>
      )}
      <ControlBar
        index={index}
        setIndex={setIndex}
        total={total}
        vote={
          article
            ? {
                ...article.vote,
                update: type =>
                  send('voteArticle', { lid: article.lid, type }).then(res =>
                    setArticle({ ...article, vote: res })
                  )
              }
            : undefined
        }
      />
    </>
  );
}

function ControlBar({
  index,
  setIndex,
  total,
  vote
}: {
  index: number;
  setIndex: (index: number) => void;
  total: number;
  vote?: {
    upvotes: number;
    voted: -1 | 0 | 1;
    update: (type: -1 | 0 | 1) => void;
  };
}) {
  return (
    <div>
      {vote && (
        <div className="vote">
          <VSCodeButton
            appearance="icon"
            style={
              vote.voted === 1 ? { color: 'rgb(52, 152, 219)' } : undefined
            }
            onClick={() => vote.update(vote.voted === 1 ? 0 : 1)}
          >
            <FontAwesomeIcon icon={faThumbsUp} />
            {vote.upvotes}
          </VSCodeButton>
          <VSCodeButton
            appearance="icon"
            style={
              vote.voted === -1 ? { color: 'rgb(52, 152, 219)' } : undefined
            }
            onClick={() => vote.update(vote.voted === -1 ? 0 : -1)}
          >
            <FontAwesomeIcon icon={faThumbsDown} />
          </VSCodeButton>
        </div>
      )}
      <div className="pageShow">
        第 {index + 1}/{total} 篇
      </div>
      <div className="pageControl">
        <VSCodeButton
          appearance="secondary"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          上一篇
        </VSCodeButton>
        <VSCodeButton
          appearance="primary"
          disabled={total === 0 || index + 1 === total}
          onClick={() => setIndex(index + 1)}
        >
          下一篇
        </VSCodeButton>
      </div>
    </div>
  );
}
