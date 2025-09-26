
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { addVideo, deleteVideo, getVideos } from './actions'; // UPDATED import path
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import type { Video } from '@/lib/mock-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/auth-context';

type VideoWithId = Video & { docId: string };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                </>
            ) : (
                <>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Video
                </>
            )}
        </Button>
    );
}


export function VideoManagementTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const formRef = useRef<HTMLFormElement>(null);
  const [videos, setVideos] = useState<VideoWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [state, setState] = useState({ success: false, message: '', errors: {} as any });

  const formAction = async (formData: FormData) => {
    if (!user) {
        toast({ title: 'Not Logged In', description: 'You must be logged in to add a video.', variant: 'destructive' });
        const newState = { success: false, message: 'User not authenticated.', errors: {} };
        setState(newState);
        return;
    }
    const authToken = await user.getIdToken(true);
    formData.set('authToken', authToken);
    const result = await addVideo(state, formData);
    setState(result);
  };


  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getVideos();
      if (response.success && Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        toast({
            title: "Error fetching videos",
            description: response.error || "Could not load videos from the server.",
            variant: "destructive"
        })
        setVideos([]); // Set to empty array on failure
      }
    } catch (error) {
        toast({
            title: "Error fetching videos",
            description: "Could not load videos from the server.",
            variant: "destructive"
        })
         setVideos([]); // Also set to empty on catch
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (state?.message && (state.success || state.errors)) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
    if (state.success) {
      formRef.current?.reset();
      fetchVideos();
    }
  }, [state, toast, fetchVideos]);

  const handleDelete = async (videoId: string) => {
     if (!user) {
        toast({ title: 'Not Logged In', description: 'You must be logged in to delete a video.', variant: 'destructive' });
        return;
    }
    setIsDeleting(videoId);
    const authToken = await user.getIdToken(true);
    const result = await deleteVideo(videoId, authToken);
    toast({
      title: result.success ? 'Success!' : 'Error',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    if (result.success) {
      fetchVideos();
    }
    setIsDeleting(null);
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <form ref={formRef} action={formAction}>
            <CardHeader>
              <CardTitle>Add New Video</CardTitle>
              <CardDescription>Fill the form to add a new video to the library.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input id="title" name="title" placeholder="e.g., Master the Present Tense" />
                {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="A short summary of the video." />
                 {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeVideoId">YouTube Video ID</Label>
                <Input id="youtubeVideoId" name="youtubeVideoId" placeholder="e.g., wggB0hT2L24" />
                <p className="text-xs text-muted-foreground">From a youtube.com/watch?v=VIDEO_ID URL.</p>
                 {state.errors?.youtubeVideoId && <p className="text-sm text-destructive">{state.errors.youtubeVideoId[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="Grammar">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grammar">Grammar</SelectItem>
                    <SelectItem value="Pronunciation">Pronunciation</SelectItem>
                    <SelectItem value="Vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="Conversation">Conversation</SelectItem>
                  </SelectContent>
                </Select>
                 {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
              </div>
            </CardContent>
            <CardFooter>
                <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
            <CardHeader>
                <CardTitle>Current Video Library</CardTitle>
                <CardDescription>The videos currently available to users.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : videos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No videos in the library yet.</p>
                ) : (
                    <div className="space-y-4">
                        {videos.map(video => (
                            <div key={video.docId} className="flex items-center gap-4 rounded-lg border p-3">
                                <Image 
                                    src={`https://img.youtube.com/vi/${video.youtubeVideoId}/default.jpg`}
                                    alt={video.title}
                                    width={120}
                                    height={90}
                                    className="rounded-md aspect-video object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold">{video.title}</p>
                                    <p className="text-sm text-muted-foreground">{video.category}</p>
                                </div>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={isDeleting === video.docId}>
                                      {isDeleting === video.docId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the video titled "{video.title}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(video.docId)} className="bg-destructive hover:bg-destructive/90">
                                        Yes, delete it
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
