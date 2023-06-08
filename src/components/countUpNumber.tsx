// start from 0 and count up to the value

import compactNumber from "@/utils/compactNumber";
import { useState, useEffect, useRef } from "react";

function numberToAdd(num: number): number {
  // i.e 1136 -> 100
  // i.e 9 -> 1

  let factor = 1;

  while (num >= 10) {
    num = Math.floor(num / 10);
    factor *= 10;
  }

  return Math.floor(factor);
}

export default function CountUpNumber({ num }: { num: number }) {
  const currentNum = useRef<HTMLDivElement>(null);
  const number = useRef<number>(0);

  useEffect(() => {
    let countUp: NodeJS.Timeout;
    const factor = numberToAdd(num);

    setTimeout(() => {
      countUp = setInterval(() => {
        if (!currentNum.current) return;
        if (number.current >= num) {
          currentNum.current.innerHTML = compactNumber(num);
          clearInterval(countUp);
          return;
        }

        number.current += factor / 10;
        currentNum.current.innerHTML = compactNumber(number.current);
      }, 25);
    }, 1000);
    return () => {
      clearInterval(countUp);
    };
  }, []);

  return <div ref={currentNum}>{0}</div>;
}
