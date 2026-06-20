const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function targetPath(...segments) {
  return path.join(root, ...segments);
}

const patches = [
  {
    file: targetPath("node_modules", "react-native", "Libraries", "vendor", "emitter", "EventEmitter.js"),
    replacements: [["#registry", "_registry"]],
  },
  {
    file: targetPath("node_modules", "react-native", "Libraries", "Debugging", "DebuggingOverlayRegistry.js"),
    replacements: [
      ["#registry", "_registry"],
      ["#reactDevToolsAgent", "_reactDevToolsAgent"],
      ["#onReactDevToolsAgentAttached", "_onReactDevToolsAgentAttached"],
      ["#getPublicInstanceFromInstance", "_getPublicInstanceFromInstance"],
      ["#findLowestParentFromRegistryForInstanceLegacy", "_findLowestParentFromRegistryForInstanceLegacy"],
      ["#findLowestParentFromRegistryForInstance", "_findLowestParentFromRegistryForInstance"],
      ["#onDrawTraceUpdates", "_onDrawTraceUpdates"],
      ["#drawTraceUpdatesModern", "_drawTraceUpdatesModern"],
      ["#drawTraceUpdatesLegacy", "_drawTraceUpdatesLegacy"],
      ["#onHighlightElements", "_onHighlightElements"],
      ["#onHighlightElementsModern", "_onHighlightElementsModern"],
      ["#onHighlightElementsLegacy", "_onHighlightElementsLegacy"],
      ["#onClearElementsHighlights", "_onClearElementsHighlights"],
    ],
  },
  {
    file: targetPath("node_modules", "react-native", "Libraries", "Animated", "nodes", "AnimatedValue.js"),
    replacements: [
      ["#listenerCount", "_listenerCount"],
      ["#updateSubscription", "_updateSubscription"],
      ["#ensureUpdateSubscriptionExists", "_ensureUpdateSubscriptionExists"],
    ],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "errors", "DOMException.js"),
    replacements: [["#name", "_name"], ["#code", "_code"]],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "performance", "EventTiming.js"),
    replacements: [["#processingStart", "_processingStart"], ["#processingEnd", "_processingEnd"], ["#interactionId", "_interactionId"]],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "performance", "MemoryInfo.js"),
    replacements: [["#jsHeapSizeLimit", "_jsHeapSizeLimit"], ["#totalJSHeapSize", "_totalJSHeapSize"], ["#usedJSHeapSize", "_usedJSHeapSize"]],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "performance", "PerformanceEntry.js"),
    replacements: [["#name", "_name"], ["#entryType", "_entryType"], ["#startTime", "_startTime"], ["#duration", "_duration"]],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "performance", "PerformanceObserver.js"),
    replacements: [
      ["#entries", "_entries"],
      ["#nativeObserverHandle", "_nativeObserverHandle"],
      ["#callback", "_callback"],
      ["#type", "_type"],
      ["#calledAtLeastOnce", "_calledAtLeastOnce"],
      ["#createNativeObserver", "_createNativeObserver"],
      ["#validateObserveOptions", "_validateObserveOptions"],
    ],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "performance", "ReactNativeStartupTiming.js"),
    replacements: [
      ["#startTime", "_startTime"],
      ["#endTime", "_endTime"],
      ["#initializeRuntimeStart", "_initializeRuntimeStart"],
      ["#initializeRuntimeEnd", "_initializeRuntimeEnd"],
      ["#executeJavaScriptBundleEntryPointStart", "_executeJavaScriptBundleEntryPointStart"],
      ["#executeJavaScriptBundleEntryPointEnd", "_executeJavaScriptBundleEntryPointEnd"],
    ],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "performance", "ResourceTiming.js"),
    replacements: [
      ["#fetchStart", "_fetchStart"],
      ["#requestStart", "_requestStart"],
      ["#connectStart", "_connectStart"],
      ["#connectEnd", "_connectEnd"],
      ["#responseStart", "_responseStart"],
      ["#responseEnd", "_responseEnd"],
      ["#responseStatus", "_responseStatus"],
    ],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "webapis", "performance", "UserTiming.js"),
    replacements: [["#detail", "_detail"]],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "devsupport", "rndevtools", "FuseboxSessionObserver.js"),
    replacements: [["#hasNativeSupport", "_hasNativeSupport"]],
  },
  {
    file: targetPath("node_modules", "react-native", "src", "private", "devsupport", "rndevtools", "setUpFuseboxReactDevToolsDispatcher.js"),
    replacements: [["#listeners", "_listeners"], ["#domainNameToDomainMap", "_domainNameToDomainMap"]],
  },
  {
    file: targetPath("node_modules", "react-native-worklets", "lib", "module", "WorkletsModule", "NativeWorklets.js"),
    replacements: [
      ["#workletsModuleProxy", "_workletsModuleProxy"],
      ["#serializableUndefined", "_serializableUndefined"],
      ["#serializableNull", "_serializableNull"],
      ["#serializableTrue", "_serializableTrue"],
      ["#serializableFalse", "_serializableFalse"],
    ],
  },
  {
    file: targetPath("node_modules", "react-native-reanimated", "lib", "module", "WorkletEventHandler.js"),
    replacements: [["#viewTags", "_viewTags"], ["#registrations", "_registrations"]],
  },
  {
    file: targetPath("node_modules", "react-native-reanimated", "lib", "module", "createAnimatedComponent", "NativeEventsManager.js"),
    replacements: [
      ["#managedComponent", "_managedComponent"],
      ["#componentOptions", "_componentOptions"],
      ["#eventViewTag", "_eventViewTag"],
    ],
  },
  {
    file: targetPath("node_modules", "react-native-reanimated", "lib", "module", "ReanimatedModule", "NativeReanimated.js"),
    replacements: [["#workletsModule", "_workletsModule"], ["#reanimatedModuleProxy", "_reanimatedModuleProxy"]],
  },
  {
    file: targetPath("node_modules", "react-native-reanimated", "lib", "module", "ReanimatedModule", "js-reanimated", "JSReanimated.js"),
    replacements: [["#workletsModule", "_workletsModule"]],
  },
];

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const original = fs.readFileSync(filePath, "utf8");
  let updated = original;

  for (const [searchValue, replaceValue] of replacements) {
    updated = updated.split(searchValue).join(replaceValue);
  }

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`patched: ${path.relative(root, filePath)}`);
    return true;
  }

  return false;
}

let changed = false;
for (const patch of patches) {
  changed = patchFile(patch.file, patch.replacements) || changed;
}

if (!changed) {
  console.log("startup private-field patch already applied");
}
