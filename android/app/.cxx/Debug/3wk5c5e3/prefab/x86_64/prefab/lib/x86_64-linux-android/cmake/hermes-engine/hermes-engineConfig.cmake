if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/50c39046a20b4a6178875e776c3dfdd5/transformed/jetified-hermes-android-0.82.1-debug/prefab/modules/hermesvm/libs/android.x86_64/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/50c39046a20b4a6178875e776c3dfdd5/transformed/jetified-hermes-android-0.82.1-debug/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

