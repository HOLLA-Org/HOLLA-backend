import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@/modules/users/schemas/user.schema';
import { Booking, BookingDocument } from '@/modules/booking/schemas/booking.shema';
import { BookingStatus, ROLES } from '@/constant';
import dayjs from 'dayjs';

@Injectable()
export class StatisticService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    ) { }

    async getDashboardStats() {
        const now = dayjs();
        const startOfToday = now.startOf('day').toDate();

        // 1. Total Users (Filter by role: user only)
        const totalUsers = await this.userModel.countDocuments({ role: ROLES.user });
        const usersBeforeToday = await this.userModel.countDocuments({
            role: ROLES.user,
            createdAt: { $lt: startOfToday },
        });
        const userChange = this.calculatePercentageChange(totalUsers, usersBeforeToday);

        // 2. Total Bookings
        const totalBookings = await this.bookingModel.countDocuments();
        const bookingsBeforeToday = await this.bookingModel.countDocuments({
            booked_at: { $lt: startOfToday },
        });
        const bookingChange = this.calculatePercentageChange(totalBookings, bookingsBeforeToday);

        // 3. Total Revenue
        const totalRevenueResult = await this.bookingModel.aggregate([
            { $match: { status: { $ne: BookingStatus.CANCELLED } } },
            { $group: { _id: null, total: { $sum: '$total_price' } } },
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        const revenueBeforeTodayResult = await this.bookingModel.aggregate([
            {
                $match: {
                    status: { $ne: BookingStatus.CANCELLED },
                    booked_at: { $lt: startOfToday },
                },
            },
            { $group: { _id: null, total: { $sum: '$total_price' } } },
        ]);
        const revenueBeforeToday = revenueBeforeTodayResult[0]?.total || 0;
        const revenueChange = this.calculatePercentageChange(totalRevenue, revenueBeforeToday);

        // 4. Pending Bookings
        const pendingBookings = await this.bookingModel.countDocuments({
            status: BookingStatus.PENDING,
        });
        const pendingBeforeToday = await this.bookingModel.countDocuments({
            status: BookingStatus.PENDING,
            booked_at: { $lt: startOfToday },
        });
        const pendingChange = this.calculatePercentageChange(pendingBookings, pendingBeforeToday);

        return {
            users: {
                total: totalUsers,
                change: userChange,
            },
            bookings: {
                total: totalBookings,
                change: bookingChange,
            },
            revenue: {
                total: totalRevenue,
                change: revenueChange,
            },
            pending: {
                total: pendingBookings,
                change: pendingChange,
            },
        };
    }

    private calculatePercentageChange(current: number, previous: number) {
        if (previous === 0) return current > 0 ? 100 : 0;
        const change = ((current - previous) / previous) * 100;
        return parseFloat(change.toFixed(2));
    }

    async getChartData(type: 'week' | 'month' | 'year' = 'year', date?: string) {
        const referenceDate = date ? dayjs(date) : dayjs();
        let startDate: Date;
        let endDate: Date;
        let groupBy: any;
        let formatLabel: (point: any) => string;
        let length: number;

        if (type === 'week') {
            startDate = referenceDate.startOf('week').toDate();
            endDate = referenceDate.endOf('week').toDate();
            groupBy = { $dayOfWeek: '$booked_at' }; // 1 (Sun) to 7 (Sat)
            const userGroupBy = { $dayOfWeek: '$createdAt' };
            length = 7;
            formatLabel = (i) => {
                const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                return days[i];
            };

            const [bookingStats, userStats] = await Promise.all([
                this.bookingModel.aggregate([
                    { $match: { status: { $ne: BookingStatus.CANCELLED }, booked_at: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: groupBy, revenue: { $sum: '$total_price' }, bookings: { $sum: 1 } } }
                ]),
                this.userModel.aggregate([
                    { $match: { role: ROLES.user, createdAt: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: userGroupBy, users: { $sum: 1 } } }
                ])
            ]);

            return Array.from({ length }, (_, i) => {
                const mongoDay = i + 1; // 1 = Sun, 2 = Mon...
                const bStat = bookingStats.find(s => s._id === mongoDay);
                const uStat = userStats.find(s => s._id === mongoDay);
                return {
                    label: formatLabel(i),
                    revenue: bStat?.revenue || 0,
                    users: uStat?.users || 0,
                    bookings: bStat?.bookings || 0,
                };
            });
        } else if (type === 'month') {
            startDate = referenceDate.startOf('month').toDate();
            endDate = referenceDate.endOf('month').toDate();
            groupBy = { $dayOfMonth: '$booked_at' };
            const userGroupBy = { $dayOfMonth: '$createdAt' };
            length = referenceDate.daysInMonth();
            formatLabel = (i) => `${i + 1}`;

            const [bookingStats, userStats] = await Promise.all([
                this.bookingModel.aggregate([
                    { $match: { status: { $ne: BookingStatus.CANCELLED }, booked_at: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: groupBy, revenue: { $sum: '$total_price' }, bookings: { $sum: 1 } } }
                ]),
                this.userModel.aggregate([
                    { $match: { role: ROLES.user, createdAt: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: userGroupBy, users: { $sum: 1 } } }
                ])
            ]);

            return Array.from({ length }, (_, i) => {
                const day = i + 1;
                const bStat = bookingStats.find(s => s._id === day);
                const uStat = userStats.find(s => s._id === day);
                return {
                    label: formatLabel(i),
                    revenue: bStat?.revenue || 0,
                    users: uStat?.users || 0,
                    bookings: bStat?.bookings || 0,
                };
            });
        } else {
            // Default: Year
            startDate = referenceDate.startOf('year').toDate();
            endDate = referenceDate.endOf('year').toDate();
            groupBy = { $month: '$booked_at' };
            const userGroupBy = { $month: '$createdAt' };
            length = 12;
            formatLabel = (i) => `Thg ${i + 1}`;

            const [bookingStats, userStats] = await Promise.all([
                this.bookingModel.aggregate([
                    { $match: { status: { $ne: BookingStatus.CANCELLED }, booked_at: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: groupBy, revenue: { $sum: '$total_price' }, bookings: { $sum: 1 } } }
                ]),
                this.userModel.aggregate([
                    { $match: { role: ROLES.user, createdAt: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: userGroupBy, users: { $sum: 1 } } }
                ])
            ]);

            return Array.from({ length }, (_, i) => {
                const month = i + 1;
                const bStat = bookingStats.find(s => s._id === month);
                const uStat = userStats.find(s => s._id === month);
                return {
                    label: formatLabel(i),
                    revenue: bStat?.revenue || 0,
                    users: uStat?.users || 0,
                    bookings: bStat?.bookings || 0,
                };
            });
        }
    }

    async getRecentBookings(limit: number = 5) {
        const bookings = await this.bookingModel
            .find()
            .sort({ booked_at: -1 })
            .limit(limit)
            .populate('hotel_id')
            .lean();

        return (bookings as any[])
            .filter(b => b.hotel_id)
            .map(b => ({
                id: b._id,
                totalPrice: b.paid_amount ?? b.total_price,
                status: b.status,
                bookedAt: b.booked_at,
                hotel: b.hotel_id,
            }));
    }
}
