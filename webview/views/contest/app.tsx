const { default: React } = await import('react');
const { Tag } = await import('@w/components');
const { ContestRuleTypes, ContestVisibilityTypes } = await import(
  '@/utils/shared'
);
const { default: Time } = await import('@w/components/time');

import type { ContestData } from 'luogu-api';

import '@w/common.css';
import ColorPalette from '@/utils/color';
import { UserName } from '@w/components';
import { UserInfo } from '@/model/user';

export default function App({
  children: contestData
}: {
  children: ContestData;
}) {
  return (
    <>
      <header>
        <h1>{contestData.contest.name}</h1>
        <div>
          <div>
            比赛 ID：{contestData.contest.id}{' '}
            <Tag>{ContestRuleTypes[contestData.contest.ruleType]}</Tag>
            <Tag>
              {ContestVisibilityTypes[contestData.contest.visibilityType]}
            </Tag>
            {contestData.contest.rated && (
              <Tag color={ColorPalette['cyan-3']}>咕</Tag>
            )}
            {contestData.contest.eloThreshold !== null &&
              contestData.contest.eloThreshold >= 0 && (
                <Tag
                  color={
                    ColorPalette[
                      contestData.contest.eloThreshold <= 1200
                        ? 'blue-3'
                        : contestData.contest.eloThreshold <= 1600
                          ? 'green-3'
                          : contestData.contest.eloThreshold <= 2000
                            ? 'orange-3'
                            : 'red-3'
                    ]
                  }
                >
                  ELO
                  {contestData.contest.eloThreshold < 9999 &&
                    ' for ≤' + contestData.contest.eloThreshold}
                </Tag>
              )}
          </div>
          <div>
            比赛时间：
            <Time
              time={contestData.contest.startTime * 1000}
              withoutSecond
            /> ~{' '}
            <Time time={contestData.contest.endTime * 1000} withoutSecond /> (
            <ContestDuringTime
              start={contestData.contest.startTime}
              end={contestData.contest.endTime}
            />
            )
          </div>
          <div>
            举办者：
            {'uid' in contestData.contest.host ? (
              <UserName user={new UserInfo(contestData.contest.host)} />
            ) : (
              <a
                href={
                  'https://www.luogu.com.cn/team/' + contestData.contest.host.id
                }
              >
                {contestData.contest.name}
              </a>
            )}
          </div>
          <div>
            共 {contestData.contest.problemCount} 题 ·{' '}
            {contestData.contest.totalParticipants} 人报名
          </div>
        </div>
      </header>
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
