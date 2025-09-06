const { default: React, useEffect, useState } = await import('react');
const { VSCodeProgressRing } = await import('@vscode/webview-ui-toolkit/react');
const { default: send } = await import('@w/webviewRequest');
const { UserName } = await import('@w/components');
const { default: Pagination } = await import('@w/components/pagination');
const { UserInfo } = await import('@/model/user');
const { formatTime } = await import('@/utils/stringUtils');

import type {
  GetScoreboardResponse,
  Score,
  LegacyProblemSummary
} from 'luogu-api';
import './ranklist.css';
import { ColoredScore } from './scoreUtils';

export default function Ranklist({
  problems
}: {
  problems: { score: number; problem: LegacyProblemSummary }[];
}) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scoreboard, setScoreboard] = useState<GetScoreboardResponse | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    send('ContestRanklist', { page })
      .then(res => {
        if (!mounted) return;
        const data = res;
        if (data && data.scoreboard) {
          setScoreboard(data);
          const list = data.scoreboard;
          if (list && typeof list.count === 'number') {
            const result = list.result;
            const resultLen = Array.isArray(result)
              ? result.length
              : Object.keys(result).length;
            const per = list.perPage || resultLen || 1;
            setTotalPages(Math.max(1, Math.ceil(list.count / per)));
          }
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  const contestFullScore = problems.reduce(
    (a, b) => a + Math.floor((b.score / 100) * b.problem.fullScore),
    0
  );

  return (
    <div className="cr">
      <div className="cr-table-wrapper">
        <div className="cr-table">
          <div className="cr-row cr-header" role="row">
            <div className="cr-col cr-col-rank">#</div>
            <div className="cr-col cr-col-user">用户</div>
            <div className="cr-col cr-col-score">总分</div>
            {problems.map((p, i) => (
              <div
                className="cr-col cr-col-score"
                key={i}
                title={p.problem.pid + ' ' + p.problem.title}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          {scoreboard &&
            scoreboard.scoreboard &&
            !loading &&
            Object.values(
              scoreboard.scoreboard.result satisfies { [index: number]: Score }
            ).map((s, i, items) => {
              const per = scoreboard.scoreboard.perPage || items.length;
              return (
                <div className="cr-row" role="row" key={i}>
                  <div className="cr-col cr-col-rank">
                    {(page - 1) * per + i + 1}
                  </div>
                  <div className="cr-col cr-col-user">
                    <UserName user={new UserInfo(s.user)} />
                  </div>
                  <div className="cr-col cr-col-score">
                    <ColoredScore full={contestFullScore} score={s.score} />
                    <span>({formatTime(s.runningTime)})</span>
                  </div>
                  {problems.map(p => {
                    const detail = (
                      s.details as {
                        [k: string]:
                          | { score: number; runningTime?: number | undefined }
                          | undefined;
                      }
                    )[p.problem.pid];
                    return (
                      <div className="cr-col cr-col-score" key={p.problem.pid}>
                        {detail !== undefined && (
                          <>
                            <ColoredScore
                              full={Math.floor(
                                (p.score / 100) * p.problem.fullScore
                              )}
                              score={detail.score}
                            />
                            {detail.runningTime !== undefined && (
                              <span>({formatTime(detail.runningTime)})</span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
      {loading && (
        <div className="cr-loading">
          <VSCodeProgressRing />
        </div>
      )}
      <div>
        <Pagination
          current={page}
          total={totalPages}
          onChange={p => setPage(p)}
        />
      </div>
    </div>
  );
}
