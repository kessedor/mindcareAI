import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

interface Therapist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  image: string;
  availability: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const ScheduleTherapy: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const therapists: Therapist[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Anxiety & Depression',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      availability: ['monday', 'tuesday', 'wednesday', 'friday'],
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Trauma & PTSD',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      availability: ['tuesday', 'wednesday', 'thursday', 'friday'],
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Relationship Counseling',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      availability: ['monday', 'wednesday', 'thursday', 'saturday'],
    },
  ];

  const timeSlots: TimeSlot[] = [
    { time: '09:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '01:00 PM', available: true },
    { time: '02:00 PM', available: true },
    { time: '03:00 PM', available: false },
    { time: '04:00 PM', available: true },
    { time: '05:00 PM', available: true },
  ];

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      });
    }
    return dates;
  };

  const availableDates = getNextWeekDates();
  const selectedTherapistData = therapists.find(t => t.id === selectedTherapist);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTherapist || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-display font-bold text-neutral-900 mb-4">
              Appointment Scheduled!
            </h1>
            <p className="text-neutral-600 mb-6">
              Your therapy session has been successfully scheduled. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Therapist:</span>
                  <span className="font-medium">{selectedTherapistData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Date:</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/ai-chat')}>
                Continue AI Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-8 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/ai-chat"
            className="inline-flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to AI Chat</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              Schedule Therapy Session
            </h1>
            <p className="text-neutral-600">
              Book a session with one of our licensed therapists
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Therapist Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-primary-600" />
              Choose Your Therapist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {therapists.map((therapist) => (
                <div
                  key={therapist.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTherapist === therapist.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setSelectedTherapist(therapist.id)}
                >
                  <div className="text-center">
                    <img
                      src={therapist.image}
                      alt={therapist.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                    />
                    <h3 className="font-semibold text-neutral-900 mb-1">{therapist.name}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{therapist.specialty}</p>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-medium">{therapist.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              Select Date
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {availableDates.map((date) => {
                const isAvailable = selectedTherapistData?.availability.includes(date.dayName) ?? true;
                return (
                  <button
                    key={date.value}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedDate(date.value)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedDate === date.value
                        ? 'bg-primary-500 text-white'
                        : isAvailable
                        ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                        : 'bg-neutral-50 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {date.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary-600" />
              Select Time
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedTime === slot.time
                      ? 'bg-primary-500 text-white'
                      : slot.available
                      ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                      : 'bg-neutral-50 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Additional Notes (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific topics you'd like to discuss or information your therapist should know..."
              rows={4}
              className="w-full p-3 border border-neutral-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              disabled={!selectedTherapist || !selectedDate || !selectedTime || isSubmitting}
              size="lg"
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Scheduling...
                </>
              ) : (
                'Schedule Appointment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleTherapy;