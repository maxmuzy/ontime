import { Alert } from '../../../../components/ui/alert';
import * as Panel from '../../panel-utils/PanelUtils';

import EditorSettingsForm from './EditorSettingsForm';

export default function InterfacePanel() {
  return (
    <>
      <Panel.Header>Interface</Panel.Header>
      <Panel.Section>
        <Alert
          status='info'
          variant='ontime-on-dark-info'
          title={
            <>
              {/* <AlertIcon /> */}
              Interface settings
              <br />
              <br />
              These concern settings that are applied to this user in this browser.
              <br />
              It will not affect other users or other browsers.
            </>
          }
        />
      </Panel.Section>
      <EditorSettingsForm />
    </>
  );
}
