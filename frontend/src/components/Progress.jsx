<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
>>>>>>> parent of fabc826 (second commit)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { statsAPI, goalsAPI } from '../utils/api';
import BottomBar from './BottomBar';
=======
import { Bar, Line, Doughnut } from 'react-chartjs-2';
>>>>>>> parent of fabc826 (second commit)
=======
import { Bar, Line, Doughnut } from 'react-chartjs-2';
>>>>>>> parent of fabc826 (second commit)
=======
import { Bar, Line, Doughnut } from 'react-chartjs-2';
>>>>>>> parent of fabc826 (second commit)
=======
import { Bar, Line, Doughnut } from 'react-chartjs-2';
>>>>>>> parent of fabc826 (second commit)
=======
import { Bar, Line, Doughnut } from 'react-chartjs-2';
>>>>>>> parent of fabc826 (second commit)
import Header from './Header';
import BottomBar from './BottomBar';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
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
  const [subjectStats, setSubjectStats] = useState({
    labels: [],
    hours: []
  });
  const [weeklyTotal, setWeeklyTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        setLoading(true);
=======
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
=======
>>>>>>> parent of fabc826 (second commit)
        const token = localStorage.getItem('token');
>>>>>>> parent of fabc826 (second commit)
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

    // Process subject-wise study hours and count unique subjects
    const subjectHours = {};
    const uniqueSubjects = new Set();
    
    historyData.forEach(entry => {
      if (entry.subject && entry.subject.trim() !== '') {
        uniqueSubjects.add(entry.subject);
        if (!subjectHours[entry.subject]) {
          subjectHours[entry.subject] = 0;
        }
        subjectHours[entry.subject] += (entry.timeSpent / 3600) || 0;
      }
    });

    // Calculate weekly total
    const weeklyHours = dailyHours.reduce((acc, day) => acc + (day.hours || 0), 0);

    // Update state
    setDailyStats({
      labels: dailyHours.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })),
      hours: dailyHours.map(day => day.hours)
    });

    const subjects = Array.from(uniqueSubjects);
    
    setSubjectStats({
      labels: subjects,
      hours: subjects.map(subject => Number(subjectHours[subject].toFixed(1)))
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

  const doughnutData = {
    labels: subjectStats.labels,
    datasets: [
      {
        data: subjectStats.hours,
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Study Progress</h2>
          
          {/* Weekly Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Weekly Total</h3>
              <p className="text-3xl font-bold text-blue-600">{weeklyTotal}h</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Subjects Studied</h3>
              <p className="text-3xl font-bold text-green-600">{subjectStats.labels.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Study Sessions</h3>
              <p className="text-3xl font-bold text-purple-600">{history.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border">
              <Bar options={barChartOptions} data={barChartData} />
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Subject Distribution</h3>
              <Doughnut data={doughnutData} />
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Study Sessions</h3>
          <div className="space-y-4">
            {history.slice(0, 5).map((entry) => (
              <div key={entry._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{entry.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.startTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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
      </main>

      <BottomBar />
    </div>
  );
};

export default Progress;
