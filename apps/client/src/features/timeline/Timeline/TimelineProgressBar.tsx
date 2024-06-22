import { useClock } from '../../../common/hooks/useSocket';

import { getRelativePositionX } from './timelineUtils';

import style from './TimelineProgressBar.module.scss';

interface ProgressBarProps {
  startHour: number;
  endHour: number;
}

export function ProgressBar(props: ProgressBarProps) {
  const { startHour, endHour } = props;
  const { clock } = useClock();

  const width = getRelativePositionX(startHour, endHour, clock);

  return (
    <div className={style.progressBar}>
      <div className={style.progress} style={{ width: `${width}%` }} />
    </div>
  );
}
