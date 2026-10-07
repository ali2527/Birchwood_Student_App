if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/97c16419c1089f82511cc6150d259292/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/libs/android.x86_64/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/97c16419c1089f82511cc6150d259292/transformed/jetified-fbjni-0.7.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

