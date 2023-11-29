import { Platform } from "react-native"

const fonts = {
    euclidCircularA: Platform.OS == 'android' ? {
        boldItalic: 'Euclid Circular A Bold Italic',
        bold: 'Euclid Circular A Bold',
        italic: 'Euclid Circular A Italic',
        lightItalic: 'Euclid Circular A Light Italic',
        light: 'Euclid Circular A Light',
        mediumItalic: 'Euclid Circular A Medium Italic',
        medium: 'Euclid Circular A Medium',
        regular: 'Euclid Circular A Regular',
        semiBoldItalic: 'Euclid Circular A SemiBold Italic',
        semiBold: 'Euclid Circular A SemiBold',
        glroyBold:'Glory Bold'

    } : {
        boldItalic: 'EuclidCircularA-BoldItalic',
        bold: 'EuclidCircularA-Bold',
        italic: 'EuclidCircularA-Italic',
        lightItalic: 'EuclidCircularA-LightItalic',
        light: 'EuclidCircularA-Light',
        mediumItalic: 'EuclidCircularA-MediumItalic',
        medium: 'EuclidCircularA-Medium',
        regular: 'EuclidCircularA-Regular',
        semiBoldItalic: 'EuclidCircularA-SemiBoldItalic',
        semiBold: 'EuclidCircularA-SemiBold',
    }
}

export default fonts