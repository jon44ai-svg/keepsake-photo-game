# Dependencies

Main runtime packages in `apps/mobile` and why they exist:

| Package                                     | Why                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `expo`                                      | App framework, config plugins, native module host                              |
| `react` / `react-native`                    | UI                                                                             |
| `react-dom` / `react-native-web`            | Expo Web + web Storybook                                                       |
| `@expo/metro-runtime`                       | Metro runtime for Expo                                                         |
| `expo-media-library`                        | Album access and photo assets                                                  |
| `expo-status-bar`                           | Status bar styling                                                             |
| `expo-haptics`                              | Vibration / haptic feedback on Android                                         |
| `@react-native-async-storage/async-storage` | Local persistence (`src/storage.ts`)                                           |
| `@react-native-community/datetimepicker`    | Date guessing UI                                                               |
| `@react-native-ml-kit/face-detection`       | On-device face filter (native only)                                            |
| `react-native-reanimated`                   | Animations                                                                     |
| `react-native-worklets`                     | Reanimated and audio worklet runtime; pinned to the native-compatible 0.7 line |
| `react-native-safe-area-context`            | Safe area insets                                                               |
| `react-native-audio-api` / `tone`           | Live soundtrack scores on device                                               |

Dev / docs:

| Package                                                   | Why                           |
| --------------------------------------------------------- | ----------------------------- |
| `typescript` / `vitest`                                   | Types and domain tests        |
| `@storybook/react-native`                                 | On-device Storybook host      |
| `@storybook/react-native-web-vite` / `vite` / `storybook` | Web Storybook for docs deploy |
| `vitepress` (`apps/docs`)                                 | Human-readable docs site      |

Adding a main dependency: update this page and [decisions](./decisions) if the choice is product-relevant.
