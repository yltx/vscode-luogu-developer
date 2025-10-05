const { default: React } = await import('react');
const { Tag } = await import('@w/components');
const { ContestRuleTypes, ContestVisibilityTypes } = await import(
  '@/utils/shared'
);
const { default: Time } = await import('@w/components/time');
const { UserName } = await import('@w/components');
const { default: ColorPalette } = await import('@/utils/color');
const { UserInfo } = await import('@/model/user');

const { default: ArticleViewer } = await import('@w/markdownViewer');
const { default: Navbar } = await import('@w/components/navbar');
const { default: send } = await import('@w/webviewRequest');

import Ranklist from './ranklist';
import { FormatScore } from './scoreUtils';
const { FontAwesomeIcon } = await import('@fortawesome/react-fontawesome');
const { faCheck, faRotateRight } = await import(
  '@fortawesome/free-solid-svg-icons'
);
const { VSCodeButton } = await import('@vscode/webview-ui-toolkit/react');
import type { ContestData } from 'luogu-api';

import '@w/common.css';
import './app.css';

export default function App({
  children: contestData
}: {
  children: ContestData;
}) {
  const [tab, setTab] = React.useState<'detail' | 'ranklist'>('detail');
  const [data, setData] = React.useState<ContestData>(contestData);
  const [reloading, setReloading] = React.useState(false);
  return (
    <>
      <header>
        <h1>{data.contest.name}</h1>
        <div>
          <div>
            比赛 ID：
            <a href={`https://www.luogu.com.cn/contest/${data.contest.id}`}>
              {data.contest.id}
            </a>{' '}
            <Tag>{ContestRuleTypes[contestData.contest.ruleType]}</Tag>
            <Tag>
              {ContestVisibilityTypes[contestData.contest.visibilityType]}
            </Tag>
            {data.contest.rated && <Tag color={ColorPalette['cyan-3']}>咕</Tag>}
            {data.contest.eloThreshold !== null &&
              data.contest.eloThreshold >= 0 && (
                <Tag
                  color={
                    ColorPalette[
                      data.contest.eloThreshold <= 1200
                        ? 'blue-3'
                        : data.contest.eloThreshold <= 1600
                          ? 'green-3'
                          : data.contest.eloThreshold <= 2000
                            ? 'orange-3'
                            : 'red-3'
                    ]
                  }
                >
                  ELO
                  {data.contest.eloThreshold < 9999 &&
                    ' for ≤' + data.contest.eloThreshold}
                </Tag>
              )}
          </div>
          <div>
            比赛时间：
            <Time time={data.contest.startTime * 1000} withoutSecond /> ~{' '}
            <Time time={data.contest.endTime * 1000} withoutSecond /> (
            <ContestDuringTime
              start={data.contest.startTime}
              end={data.contest.endTime}
            />
            )
          </div>
          <div>
            举办者：
            {'uid' in data.contest.host ? (
              <UserName user={new UserInfo(data.contest.host)} />
            ) : (
              <a href={'https://www.luogu.com.cn/team/' + data.contest.host.id}>
                {data.contest.name}
              </a>
            )}
          </div>
          <div>
            共 {data.contest.problemCount} 题 · {data.contest.totalParticipants}{' '}
            人报名
          </div>
        </div>
      </header>
      {data.contestProblems && (
        <>
          <hr />
          <div className="contest-problems">
            <div className="cp-table">
              <div className="cp-row cp-header" role="row">
                <div className="cp-col cp-col-index">#</div>
                <div className="cp-col cp-col-maxscore">倍率(%)</div>
                <div className="cp-col cp-col-title">题目名称</div>
                <div className="cp-col cp-col-submitted">已提交</div>
              </div>
              {data.contestProblems.map((p, i) => (
                <div className="cp-row" role="row" key={p.problem.pid}>
                  <div className="cp-col cp-col-index">
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="cp-col cp-col-maxscore">
                    <FormatScore score={p.score} />
                  </div>
                  <div className="cp-col cp-col-title" title={p.problem.title}>
                    <a
                      href={
                        'command:luogu.searchProblem?' +
                        encodeURIComponent(
                          JSON.stringify({
                            pid: p.problem.pid,
                            cid: data.contest.id
                          })
                        )
                      }
                    >
                      {p.problem.title}
                    </a>
                  </div>
                  <div className="cp-col cp-col-submitted">
                    {p.submitted && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="submitted-icon"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <Navbar
        actions={[
          {
            id: 'detail',
            label: '比赛详情',
            checked: tab === 'detail',
            onClick: () => setTab('detail')
          },
          {
            id: 'rank',
            label: '排行榜',
            checked: tab === 'ranklist',
            onClick: () => setTab('ranklist')
          }
        ]}
      />
      {tab === 'detail' && (
        <ArticleViewer>{data.contest.description}</ArticleViewer>
      )}
      {tab === 'ranklist' && data.contestProblems && (
        <Ranklist problems={data.contestProblems} />
      )}
      <VSCodeButton
        className="benben-reload"
        appearance="icon"
        disabled={reloading}
        onClick={async () => {
          setReloading(true);
          try {
            const fresh = await send('ContestReload', undefined);
            setData(fresh);
          } catch (err) {
            // ignore - send will surface errors via webview response handling
          } finally {
            setReloading(false);
          }
        }}
      >
        <FontAwesomeIcon icon={faRotateRight} spin={reloading} />
      </VSCodeButton>
    </>
  );
}

function ContestDuringTime({ start, end }: { start: number; end: number }) {
  let d = end - start;
  const ds = Math.floor((d /= 1)) % 60;
  const dm = Math.floor((d /= 60)) % 60;
  const dh = Math.floor((d /= 60)) % 24;
  const dd = Math.floor((d /= 24));
  return (
    <time dateTime={`${dd}d ${dh}h ${dm}m ${ds}s`}>
      {dd > 1
        ? dd.toFixed(2) + 'd'
        : dh > 1
          ? dh.toFixed(2) + 'h'
          : dm > 1
            ? dm.toFixed(2) + 'm'
            : ds + 's'}
    </time>
  );
}
