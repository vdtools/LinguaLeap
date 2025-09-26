'use client';

import { useEffect, useState } from 'react';
import { getAllUserProgress, type UserProgressData } from './actions';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function UserProgressViewer() {
  const [data, setData] = useState<UserProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAllUserProgress();
        if (response.success && Array.isArray(response.data)) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to load user progress data.');
          setData([]); // Set to empty array on failure
        }
      } catch (err: any) {
        setError('Failed to load user progress data.');
        console.error(err);
        setData([]); // Also set to empty on catch
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCompletedCount = (progress: Record<string, string>) => {
    return Object.values(progress).filter(status => status === 'completed').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading User Progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-destructive/10 text-destructive rounded-lg">
        <AlertCircle className="h-8 w-8" />
        <p className="ml-2">{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Progress Overview</CardTitle>
        <CardDescription>
          View the learning progress for all users in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Email</TableHead>
                <TableHead className="text-center">Beginner's Journey</TableHead>
                <TableHead className="text-center">Grammar Deep Dive</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-center">Level</TableHead>
                <TableHead className="text-center">Daily Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No user progress data found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="secondary">
                            {getCompletedCount(user.beginnerJourney)} chapters
                        </Badge>
                    </TableCell>
                     <TableCell className="text-center">
                        <Badge variant="secondary">
                           {getCompletedCount(user.grammarDeepDive)} parts
                        </Badge>
                    </TableCell>
                     <TableCell className="text-center">
                        <Badge variant="outline">{user.points}</Badge>
                    </TableCell>
                     <TableCell className="text-center">
                         <Badge variant="outline">Lvl {user.level}</Badge>
                    </TableCell>
                     <TableCell className="text-center">
                         <Badge variant="outline">{user.dailyStreak} 🔥</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
