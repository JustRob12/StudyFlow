import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { statsAPI } from '../utils/statsApi';
import { goalsAPI } from '../utils/goalsApi';
import BottomBar from './BottomBar';
import Header from './Header';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Progress = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    labels: [],
    hours: []
  });
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userResponse, historyResponse] = await Promise.all([
          statsAPI.getUser(),
          statsAPI.getHistory()
        ]);

        setUser(userResponse.data);
        setHistory(historyResponse.data);

        // Calculate daily stats
        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const dailyHours = last7Days.map(date => {
          const dayEntries = historyResponse.data.filter(entry => 
            new Date(entry.date).toISOString().split('T')[0] === date
          );
          return Number((dayEntries.reduce((acc, entry) => 
            acc + (entry.timeSpent || 0), 0) / 3600).toFixed(1));
        });

        setDailyStats({
          labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
          hours: dailyHours
        });

        // Calculate weekly total
        setWeeklyTotal(dailyHours.reduce((acc, hours) => acc + hours, 0));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processHistoryData = (historyData) => {
    // Get last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    // Process daily study hours
    const dailyHours = last7Days.map(date => {
      const dayEntries = historyData.filter(entry => {
        const entryDate = new Date(entry.endTime).toISOString().split('T')[0];
        return entryDate === date;
      });
      const totalHours = dayEntries.reduce((acc, entry) => {
        const timeSpent = entry.timeSpent || 0;  
        return acc + (timeSpent / 3600);
      }, 0);
      return {
        date,
        hours: Number(totalHours.toFixed(1)) || 0  
      };
    });

    // Calculate weekly total
    const weeklyHours = dailyHours.reduce((acc, day) => acc + (day.hours || 0), 0);

    // Update state
    setDailyStats({
      labels: dailyHours.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })),
      hours: dailyHours.map(day => day.hours)
    });

    setWeeklyTotal(Number(weeklyHours.toFixed(1)));
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Study Hours'
      }
    }
  };

  const barChartData = {
    labels: dailyStats.labels,
    datasets: [
      {
        label: 'Hours Studied',
        data: dailyStats.hours,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} />
      
      {/* Sticky Header Section */}
      <div className="sticky top-[72px] bg-white shadow z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
          </div>
          <p className="text-sm text-gray-500">Track your study progress and achievements</p>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#d0efff] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Weekly Total</h3>
                <p className="text-3xl font-bold text-blue-600">{weeklyTotal}h</p>
              </div>
              <div className="bg-[#d0efff] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Study Sessions</h3>
                <p className="text-3xl font-bold text-purple-600">{history.length}</p>
              </div>
              <div className="bg-[#d0efff] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Daily Average</h3>
                <p className="text-3xl font-bold text-green-600">
                  {(weeklyTotal / 7).toFixed(1)}h
                </p>
              </div>
            </div>

            {/* Bar Chart Section */}
            <div className="bg-[#d0efff] rounded-xl p-6 shadow-sm h-[400px]">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Daily Progress</h3>
              <Bar options={barChartOptions} data={barChartData} />
            </div>

            {/* Recent History */}
            <div className="bg-[#d0efff] rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Study Sessions</h3>
              <div className="space-y-4">
                {history.slice(0, 5).map((entry) => (
                  <div key={entry._id} className="flex items-center justify-between p-4 bg-white rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-900">{entry.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        {(entry.timeSpent / 3600).toFixed(1)}h
                      </p>
                      <p className="text-sm text-gray-500">{entry.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomBar />
    </div>
  );
};

export default Progress;
