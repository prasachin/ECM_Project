import React from 'react'
import { useData } from '../Contexts/DataContext'
import dayjs from 'dayjs'

export default function DataTable({ isDarkMode = false }) {
    const { selected, dataMap } = useData()

    const themeStyles = {
        cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
        cardBorder: isDarkMode ? 'border-gray-700' : 'border-gray-200',
        headingText: isDarkMode ? 'text-gray-100' : 'text-gray-800',
        primaryText: isDarkMode ? 'text-gray-200' : 'text-gray-800',
        mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        emptyText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        headerBorder: isDarkMode ? 'border-gray-600' : 'border-gray-200',
        rowBorder: isDarkMode ? 'border-gray-700' : 'border-gray-100',
        rowHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
        headerText: isDarkMode ? 'text-gray-300' : 'text-gray-700'
    }

    return (
        <div className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.cardBorder} shadow-sm p-4 mt-3 transition-colors duration-300`}>
            <h3 className={`text-lg font-semibold ${themeStyles.headingText} mb-0 transition-colors duration-300`}>
                Latest readings
            </h3>
            <table className="w-full border-collapse mt-2">
                <thead>
                    <tr className={`border-b ${themeStyles.headerBorder} transition-colors duration-300`}>
                        <th className={`text-left py-2 px-1 ${themeStyles.headerText} font-medium transition-colors duration-300`}>
                            Device
                        </th>
                        <th className={`text-center py-2 px-1 ${themeStyles.headerText} font-medium transition-colors duration-300`}>
                            Power (W)
                        </th>
                        <th className={`text-center py-2 px-1 ${themeStyles.headerText} font-medium transition-colors duration-300`}>
                            Energy (Wh)
                        </th>
                        <th className={`text-center py-2 px-1 ${themeStyles.headerText} font-medium transition-colors duration-300`}>
                            CO₂ (ppm)
                        </th>
                        <th className={`text-center py-2 px-1 ${themeStyles.headerText} font-medium transition-colors duration-300`}>
                            Time
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {selected.length === 0 && (
                        <tr>
                            <td colSpan={5} className={`py-4 px-1 ${themeStyles.emptyText} text-sm transition-colors duration-300`}>
                                Select an appliance to see data.
                            </td>
                        </tr>
                    )}
                    {selected.map(id => {
                        const list = dataMap[id] || []
                        const last = list[list.length - 1]
                        return (
                            <tr key={id} className={`border-b ${themeStyles.rowBorder} last:border-b-0 ${themeStyles.rowHover} transition-colors duration-200`}>
                                <td className={`py-2 px-1 ${themeStyles.primaryText} transition-colors duration-300`}>
                                    {id}
                                </td>
                                <td className={`text-center py-2 px-1 ${themeStyles.primaryText} transition-colors duration-300`}>
                                    {last ? last.power_w : '—'}
                                </td>
                                <td className={`text-center py-2 px-1 ${themeStyles.primaryText} transition-colors duration-300`}>
                                    {last ? last.energy_wh : '—'}
                                </td>
                                <td className={`text-center py-2 px-1 ${themeStyles.primaryText} transition-colors duration-300`}>
                                    {last ? last.co2_ppm : '—'}
                                </td>
                                <td className={`text-center py-2 px-1 ${themeStyles.primaryText} transition-colors duration-300`}>
                                    {last ? dayjs(last.ts).format('HH:mm:ss DD/MM') : '—'}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}