'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { getOrderHistory } from '../../lib/services/orderService';

const COLORS = ['#FF8A65', '#FFB74D', '#FFD54F', '#DCE775', '#81C784', '#4DB6AC', '#4DD0E1', '#4FC3F7', '#64B5F6', '#7986CB'];

interface CategoryData {
  name: string;
  count: number;
}

interface AnalyticsProps {
  className?: string;
}

const OrderAnalytics: React.FC<AnalyticsProps> = ({ className }) => {
  const [expanded, setExpanded] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<CategoryData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    const orders = getOrderHistory();
    setOrderHistory(orders);

    // Calcular elementos populares
    const itemsCount: Record<string, { name: string, count: number }> = {};
    
    // Calcular datos por categoría
    const categoryCounts: Record<string, { name: string, count: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        // Contar por producto
        if (!itemsCount[item.menuItemId]) {
          itemsCount[item.menuItemId] = { name: item.name, count: 0 };
        }
        itemsCount[item.menuItemId].count += item.quantity;
        
        // Contar por categoría
        let category = 'Sin categoría';
        if (item.categoryId) {
          category = getCategoryName(item.categoryId);
        }
        
        if (!categoryCounts[category]) {
          categoryCounts[category] = { name: category, count: 0 };
        }
        categoryCounts[category].count += item.quantity;
      });
    });
    
    // Convertir a arrays para los gráficos
    const popularItemsArray = Object.values(itemsCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);  // Top 5
    
    const categoryDataArray = Object.values(categoryCounts)
      .sort((a, b) => b.count - a.count);
    
    setPopularItems(popularItemsArray);
    setCategoryData(categoryDataArray);
  }, []);

  // Obtener nombre legible de categoría
  const getCategoryName = (categoryId: string): string => {
    const categories: Record<string, string> = {
      'tacos': 'Tacos',
      'bebidas': 'Bebidas',
      'extras': 'Extras',
      'postres': 'Postres',
    };
    
    return categories[categoryId] || categoryId;
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (orderHistory.length === 0) {
    return null; // No mostrar si no hay historial
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Análisis de Pedidos</h2>
          {expanded ? (
            <ChevronUp className="text-white" />
          ) : (
            <ChevronDown className="text-white" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 animate-fade-in">
          <div className="mb-4 flex space-x-2">
            <button 
              className={`px-3 py-1 rounded-md flex items-center ${activeChart === 'bar' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setActiveChart('bar')}
            >
              <BarChart3 size={16} className="mr-1" /> Populares
            </button>
            <button 
              className={`px-3 py-1 rounded-md flex items-center ${activeChart === 'pie' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
              onClick={() => setActiveChart('pie')}
            >
              <PieChartIcon size={16} className="mr-1" /> Categorías
            </button>
          </div>
          
          <div className="h-64 w-full">
            {activeChart === 'bar' && popularItems.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={popularItems}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {activeChart === 'pie' && categoryData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="name"
                    label={(entry: CategoryData) => entry.name}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Total de pedidos: {orderHistory.length}</p>
            <p>Productos más vendidos: {popularItems[0]?.name || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderAnalytics; 