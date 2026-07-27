import type { Schedule, ScheduleConfig, ScheduleDay } from "./types";

const TOTAL_PAGES = 604;

function toArabicNum(n: number): string {
  return n.toLocaleString("ar-EG");
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function buildSchedule(config: ScheduleConfig): Schedule {
  let pagesPerDay: number;
  let startDate: string;
  let restEvery: number;

  if (config.mode === "byDate") {
    const totalDays = daysBetween(config.startDate, config.targetDate) + 1;
    const workDays = Math.floor(totalDays * (config.restEvery / (config.restEvery + 1)));
    pagesPerDay = TOTAL_PAGES / Math.max(1, workDays);
    startDate = config.startDate;
    restEvery = config.restEvery;
  } else {
    pagesPerDay = config.pagesPerDay;
    startDate = config.startDate;
    restEvery = config.restEvery;
  }

  const days: ScheduleDay[] = [];
  let page = 1;
  let dayNum = 0;
  let workCount = 0;

  while (page <= TOTAL_PAGES) {
    const date = addDays(startDate, dayNum);
    const isRest = restEvery > 0 && workCount > 0 && workCount % restEvery === 0;

    if (isRest) {
      days.push({
        day: dayNum + 1,
        date,
        rest: true,
        fromPage: page,
        toPage: page,
        portionLabel: "مراجعة",
      });
      dayNum++;
      workCount = 0;
      continue;
    }

    const chunkSize = Math.min(Math.max(1, Math.round(pagesPerDay)), TOTAL_PAGES - page + 1);
    const fromPage = page;
    const toPage = Math.min(page + chunkSize - 1, TOTAL_PAGES);

    days.push({
      day: dayNum + 1,
      date,
      rest: false,
      fromPage,
      toPage,
      portionLabel:
        fromPage === toPage
          ? `الصفحة ${toArabicNum(fromPage)}`
          : `الصفحة ${toArabicNum(fromPage)} — ${toArabicNum(toPage)}`,
    });

    page = toPage + 1;
    dayNum++;
    workCount++;
  }

  const completes = page > TOTAL_PAGES;

  return {
    days,
    pagesPerDay: Math.round(pagesPerDay * 10) / 10,
    completes,
  };
}
