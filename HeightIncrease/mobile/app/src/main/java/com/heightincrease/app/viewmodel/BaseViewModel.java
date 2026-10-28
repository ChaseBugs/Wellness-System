package com.heightincrease.app.viewmodel;

public abstract class BaseViewModel<T> {
    protected T state;

    public T getState() {
        return state;
    }
}
