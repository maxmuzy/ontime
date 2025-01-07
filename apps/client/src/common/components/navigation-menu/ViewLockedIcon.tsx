import { IoLockClosedOutline } from 'react-icons/io5';

import { useFadeOutOnInactivity } from '../../../common/hooks/useFadeOutOnInactivity';

import style from './NavigationMenu.module.scss';

export default function ViewLockedIcon() {
  const isLockIconShown = useFadeOutOnInactivity();

  return (
    <div className={`${style.buttonContainer} ${!isLockIconShown ? style.hidden : ''}`}>
      <IoLockClosedOutline className={style.lockIcon} />
    </div>
  );
}
