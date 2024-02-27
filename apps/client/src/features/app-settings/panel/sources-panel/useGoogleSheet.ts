import { useQueryClient } from '@tanstack/react-query';
import { AuthenticationStatus, CustomFields, OntimeRundown } from 'ontime-types';
import { ImportMap } from 'ontime-utils';

import { CUSTOM_FIELDS, RUNDOWN } from '../../../../common/api/apiConstants';
import { maybeAxiosError } from '../../../../common/api/apiUtils';
import {
  patchData,
  previewRundown,
  requestConnection,
  revokeAuthentication,
  uploadRundown,
  verifyAuthenticationStatus,
} from '../../../../common/api/ontimeApi';

import { useSheetStore } from './useSheetStore';

export default function useGoogleSheet() {
  const queryClient = useQueryClient();
  // functions push data to store
  const patchStepData = useSheetStore((state) => state.patchStepData);
  const setRundown = useSheetStore((state) => state.setRundown);
  const setCustomFields = useSheetStore((state) => state.setCustomFields);

  /** whether the current session has been authenticated */
  const verifyAuth = async (): Promise<{ authenticated: AuthenticationStatus } | void> => {
    try {
      return verifyAuthenticationStatus();
    } catch (_error) {
      /** we do not handle errors here */
    }
  };

  /** requests connection to a google sheet */
  const connect = async (
    file: File,
    sheetId: string,
  ): Promise<{ verification_url: string; user_code: string } | void> => {
    try {
      return requestConnection(file, sheetId);
    } catch (_error) {
      /** we do not handle errors here */
    }
  };

  /** requests the revoking of an existing authenticated session */
  const revoke = async (): Promise<{ authenticated: AuthenticationStatus } | void> => {
    try {
      return revokeAuthentication();
    } catch (_error) {
      /** we do not handle errors here */
    }
  };

  /** fetches data from a worksheet by its ID */
  const importRundownPreview = async (sheetId: string, fileOptions: ImportMap) => {
    try {
      const data = await previewRundown(sheetId, fileOptions);
      setRundown(data.rundown);
      setCustomFields(data.customFields);
    } catch (error) {
      patchStepData({ pullPush: { available: true, error: maybeAxiosError(error) } });
    }
  };

  /** writes data to a worksheet by its ID */
  const exportRundown = async (sheetId: string, fileOptions: ImportMap) => {
    try {
      // write data to google
      await uploadRundown(sheetId, fileOptions);
      patchStepData({ pullPush: { available: false, error: '' } });
    } catch (error) {
      patchStepData({ pullPush: { available: true, error: maybeAxiosError(error) } });
    }
  };

  /** applies rundown and customFields to current project */
  const importRundown = async (rundown: OntimeRundown, customFields: CustomFields) => {
    try {
      await patchData({ rundown, customFields });
      // we are unable to optimistically set the rundown since we need
      // it to be normalised
      await queryClient.invalidateQueries({
        queryKey: [RUNDOWN, CUSTOM_FIELDS],
      });
    } catch (error) {
      patchStepData({ pullPush: { available: true, error: maybeAxiosError(error) } });
    }
  };

  return {
    connect,
    revoke,
    verifyAuth,

    importRundownPreview,
    importRundown,
    exportRundown,
  };
}
