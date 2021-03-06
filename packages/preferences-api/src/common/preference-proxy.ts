/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Disposable, DisposableCollection, Event, Emitter, Deferred } from '@theia/core/lib/common';
import { PreferenceService, PreferenceChangedEvent } from "./preference-service";

export type Configuration = {
    [preferenceName: string]: any
}
export type PreferenceEventEmitter<T> = {
    readonly onPreferenceChanged: Event<{
        readonly preferenceName: keyof T
        readonly newValue?: T[keyof T]
        readonly oldValue?: T[keyof T]
    }>
};
export type PreferenceProxy<T> = Readonly<Deferred<T>> & Disposable & PreferenceEventEmitter<T>;
export function createPreferenceProxy<T extends Configuration>(preferences: PreferenceService, configuration: T): PreferenceProxy<T> {
    const toDispose = new DisposableCollection();
    const onPreferenceChangedEmitter = new Emitter<PreferenceChangedEvent>();
    toDispose.push(onPreferenceChangedEmitter);
    toDispose.push(preferences.onPreferenceChanged(e => {
        if (e.preferenceName in configuration) {
            onPreferenceChangedEmitter.fire(e);
        }
    }));
    return new Proxy({} as any, {
        get: (_, p: string) => {
            if (p in configuration) {
                return preferences.get(p, configuration[p]);
            }
            if (p === 'onPreferenceChanged') {
                return onPreferenceChangedEmitter.event;
            }
            if (p === 'dispose') {
                return () => toDispose.dispose();
            }
            throw new Error('unexpected property: ' + p);
        }
    })
}