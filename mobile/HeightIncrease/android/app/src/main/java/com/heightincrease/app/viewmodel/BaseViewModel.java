package com.heightincrease.app.viewmodel;

import com.heightincrease.app.repository.RemoteRepository;

public abstract class BaseViewModel<T> {
    protected T state;
    protected boolean loading;
    protected String error;

    public T getState() {
        return state;
    }

    public boolean isLoading() {
        return loading;
    }

    /** The last load error, or null. */
    public String getError() {
        return error;
    }

    /** Wraps a repository callback: stores the value through apply, records the error, then calls onChange. */
    protected <V> RemoteRepository.Callback<V> track(Apply<V> apply, Runnable onChange) {
        loading = true;
        error = null;
        return new RemoteRepository.Callback<V>() {
            @Override
            public void onSuccess(V value) {
                loading = false;
                apply.apply(value);
                onChange.run();
            }

            @Override
            public void onError(String message) {
                loading = false;
                error = message;
                onChange.run();
            }
        };
    }

    protected interface Apply<V> {
        void apply(V value);
    }
}
