import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@chakra-ui/react';
import type { HTTPSettings } from 'ontime-types';
import { TimerLifeCycle } from 'ontime-types';

import { useHttpSettings, usePostHttpSettings } from '../../../common/hooks-query/useHttpSettings';
import { useEmitLog } from '../../../common/stores/logger';
import ModalLoader from '../modal-loader/ModalLoader';
import OntimeModalFooter from '../OntimeModalFooter';

import SubscriptionRow from './SubscriptionRow';

import styles from '../Modal.module.scss';

type OntimeCycle = keyof typeof TimerLifeCycle;

const placeholder = 'http://x.x.x.x:xxxx/api/path';
const sectionText: { [key in TimerLifeCycle]: { title: string; subtitle: string } } = {
  onLoad: {
    title: 'On Load',
    subtitle: 'Triggers when a timer is loaded',
  },
  onStart: {
    title: 'On Start',
    subtitle: 'Triggers when a timer starts',
  },
  onPause: {
    title: 'On Pause',
    subtitle: 'Triggers when a running timer is paused',
  },
  onStop: {
    title: 'On Stop',
    subtitle: 'Triggers when a running timer is stopped',
  },
  onUpdate: {
    title: 'On Every Second',
    subtitle: 'Triggers when a running timer is updated (at least once a second, can be more)',
  },
  onFinish: {
    title: 'On Finish',
    subtitle: 'Triggers when a running reaches 0',
  },
};

export default function HttpIntegration() {
  const { data, isFetching } = useHttpSettings();
  const { mutateAsync } = usePostHttpSettings();
  const { emitError } = useEmitLog();
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm<HTTPSettings>({
    defaultValues: data,
    values: data,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const [showSection, setShowSection] = useState<OntimeCycle>(TimerLifeCycle.onLoad);

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const resetForm = () => {
    reset(data);
  };

  const onSubmit = async (values: HTTPSettings) => {
    try {
      const newSettings: HTTPSettings = {
        enabledOut: Boolean(values.enabledOut),
        subscriptions: {
          onLoad: values.subscriptions.onLoad ?? [],
          onStart: values.subscriptions.onStart ?? [],
          onPause: values.subscriptions.onPause ?? [],
          onStop: values.subscriptions.onStop ?? [],
          onUpdate: values.subscriptions.onUpdate ?? [],
          onFinish: values.subscriptions.onFinish ?? [],
        },
      };

      console.log('debug will submit', newSettings)

      await mutateAsync(newSettings);
    } catch (error) {
      emitError(`Error setting HTML: ${error}`);
    }
  };

  if (isFetching) {
    return <ModalLoader />;
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.sectionContainer} id='http-subscriptions'>
      <div className={styles.splitSection}>
        <div>
          <span className={`${styles.sectionTitle} ${styles.main}`}>HTTP Output</span>
          <span className={styles.sectionSubtitle}>Ontime data feedback</span>
        </div>
        <Switch {...register('enabledOut')} variant='ontime-on-light' />
      </div>
      <SubscriptionRow
        cycle={TimerLifeCycle.onLoad}
        title={sectionText.onLoad.title}
        subtitle={sectionText.onLoad.subtitle}
        visible={showSection === TimerLifeCycle.onLoad}
        setShowSection={setShowSection}
        register={register}
        control={control}
        placeholder={placeholder}
      />
      <SubscriptionRow
        cycle={TimerLifeCycle.onStart}
        title={sectionText.onStart.title}
        subtitle={sectionText.onStart.subtitle}
        visible={showSection === TimerLifeCycle.onStart}
        setShowSection={setShowSection}
        register={register}
        control={control}
        placeholder={placeholder}
      />
      <SubscriptionRow
        cycle={TimerLifeCycle.onPause}
        title={sectionText.onPause.title}
        subtitle={sectionText.onPause.subtitle}
        visible={showSection === TimerLifeCycle.onPause}
        setShowSection={setShowSection}
        register={register}
        control={control}
        placeholder={placeholder}
      />
      <SubscriptionRow
        cycle={TimerLifeCycle.onStop}
        title={sectionText.onStop.title}
        subtitle={sectionText.onStop.subtitle}
        visible={showSection === TimerLifeCycle.onStop}
        setShowSection={setShowSection}
        register={register}
        control={control}
        placeholder={placeholder}
      />
      <SubscriptionRow
        cycle={TimerLifeCycle.onUpdate}
        title={sectionText.onUpdate.title}
        subtitle={sectionText.onUpdate.subtitle}
        visible={showSection === TimerLifeCycle.onUpdate}
        setShowSection={setShowSection}
        register={register}
        control={control}
        placeholder={placeholder}
      />
      <SubscriptionRow
        cycle={TimerLifeCycle.onFinish}
        title={sectionText.onFinish.title}
        subtitle={sectionText.onFinish.subtitle}
        visible={showSection === TimerLifeCycle.onFinish}
        setShowSection={setShowSection}
        register={register}
        control={control}
        placeholder={placeholder}
      />
      <OntimeModalFooter
        formId='http-subscriptions'
        handleRevert={resetForm}
        isDirty={isDirty}
        isValid={isValid}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
