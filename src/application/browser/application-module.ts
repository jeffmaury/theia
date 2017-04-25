import { ContainerModule, injectable, inject } from "inversify";
import { DialogServiceImpl } from "../browser/dialog-service";
import { SelectionService } from "../common/selection-service";
import { CommonCommandContribution, CommonMenuContribution } from "../common/commands-common";
import { TheiaApplication, TheiaPlugin } from "./application";
import { OpenerService } from "./opener-service";
import { CommandContribution, CommandContributionProvider, CommandRegistry } from "../common/command";
import { MenuModelRegistry, MenuContribution, MenuContributionProvider } from "../common/menu";
import { DialogService } from "../common/dialog-service";
import { KeybindingContextRegistry, KeybindingRegistry } from "../common/keybinding";

export const browserApplicationModule = new ContainerModule(bind => {
    bind(TheiaApplication).toSelf().inSingletonScope();
    bind(OpenerService).toSelf().inSingletonScope();
    bind(CommandRegistry).toSelf().inSingletonScope();
    bind(CommandContribution).to(CommonCommandContribution);
    bind(CommandContributionProvider).toFactory<CommandContribution[]>(ctx => {
        return () => ctx.container.getAll<CommandContribution>(CommandContribution);
    });
    bind(MenuContribution).to(CommonMenuContribution);
    bind(MenuContributionProvider).toFactory<MenuContribution[]>(ctx => {
        return () => ctx.container.getAll<MenuContribution>(MenuContribution);
    });
    bind(MenuModelRegistry).toSelf().inSingletonScope();
    bind(SelectionService).toSelf().inSingletonScope();
    bind(TheiaPlugin).to(BrowserDialogContribution).inSingletonScope();
    bind(DialogServiceImpl).toSelf().inSingletonScope();
    bind(DialogService).toDynamicValue(context => context.container.get(DialogServiceImpl));
    bind(KeybindingRegistry).toSelf().inSingletonScope();
    bind(KeybindingContextRegistry).toSelf().inSingletonScope();
});

@injectable()
export class BrowserDialogContribution implements TheiaPlugin {

    constructor(@inject(DialogServiceImpl) private dialogService: DialogServiceImpl) {}

    onStart(app: TheiaApplication): void {
        app.shell.addToMainArea(this.dialogService.createDialogContainer());
    }

}