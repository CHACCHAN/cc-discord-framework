import { Base, BaseApplyDecorator } from "../Base.js";

export const BASE_COMPONENT_META_KEY = "BaseComponent";
export function ApplyComponent(options?: { name?: string }): ClassDecorator {
    return BaseApplyDecorator(BASE_COMPONENT_META_KEY, options || {});
}

export abstract class BaseComponent extends Base {}