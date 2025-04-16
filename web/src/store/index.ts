import { configureStore } from "@reduxjs/toolkit"
import globalReducer from "./reducers/global"
import { enableMapSet } from "immer"
enableMapSet()

const store = configureStore({
  middleware: (getDefaultMiddleware: (arg0: { serializableCheck: boolean }) => any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  reducer: {
    global: globalReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
