/**
 * This file is part of Threema Web.
 *
 * Threema Web is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
 * General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Threema Web. If not, see <http://www.gnu.org/licenses/>.
 */

import {WebClientService} from '../services/webclient';
import {ControllerModelMode} from '../types/enums';
import {AvatarControllerModel} from './avatar';

export class MeControllerModel implements threema.ControllerModel {
    private logTag: string = '[MeControllerModel]';

    // Angular services
    private $log: ng.ILogService;
    private $translate: ng.translate.ITranslateService;
    private $mdDialog: ng.material.IDialogService;

    // Own services
    private webClientService: WebClientService;

    // Own receiver instance
    private me: threema.MeReceiver;

    // Avatar controller
    private avatarController: AvatarControllerModel;

    // Controller model fields
    public subject: string;
    public isLoading = false;

    // Profile data
    public nickname: string;

    // Editing mode
    private mode = ControllerModelMode.VIEW;

    constructor($log: ng.ILogService,
                $translate: ng.translate.ITranslateService,
                $mdDialog: ng.material.IDialogService,
                webClientService: WebClientService,
                mode: ControllerModelMode,
                me: threema.MeReceiver = undefined) {
        this.$log = $log;
        this.$translate = $translate;
        this.$mdDialog = $mdDialog;
        this.me = me;
        this.webClientService = webClientService;
        this.mode = mode;

        const profile = webClientService.getProfile();
        switch (mode) {
            case ControllerModelMode.EDIT:
                this.subject = $translate.instant('messenger.EDIT_PROFILE');
                this.nickname = profile.publicNickname;
                this.avatarController = new AvatarControllerModel(
                    this.$log, this.webClientService, this.me,
                );
                break;
            case ControllerModelMode.VIEW:
                this.subject = $translate.instant('messenger.MY_THREEMA_ID');
                this.nickname = profile.publicNickname;
                break;
            default:
                $log.error(this.logTag, 'Invalid controller model mode: ', this.getMode());
        }
    }

    public setOnRemoved(callback: threema.OnRemovedCallback): void {
        // Not applicable
    }

    public getMode(): ControllerModelMode {
        return this.mode;
    }

    public isValid(): boolean {
        return (this.me !== null
             && this.me !== undefined
             && this.me.id === this.webClientService.me.id);
    }

    public canChat(): boolean {
        // You cannot chat with yourself
        return false;
    }

    public canEdit(): boolean {
        // The own contact can always be edited
        // TODO: Restrictions regarding work?
        return true;
    }

    public canShowQr(): boolean {
        return true;
    }

    public save(): Promise<threema.ContactReceiver> {
        switch (this.getMode()) {
            case ControllerModelMode.EDIT:
                return this.webClientService.modifyProfile(
                    this.nickname,
                    this.avatarController.getAvatar(),
                );
            default:
                this.$log.error(this.logTag, 'Not allowed to save profile: Invalid mode');
                return;
        }
    }
}
