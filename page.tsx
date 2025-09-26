
'use client';

import { useEffect, useState, useCallback, useTransition, memo, useRef } from 'react';
import { saveSyllabusChapter, getSyllabusChapters, deleteSyllabusChapter, type Chapter } from './actions';
import { useToast } from '@/hooks/use-toast';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Save, Trash2, BookLock, Cpu, Users, Video, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AiFlowInspector } from './ai-flow-inspector';
import { UserProgressViewer } from './user-progress-viewer';
import { VideoManagementTab } from './video-management';
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


type QuizQuestionState = {
    questionText: string;
    options: string[];
    correctAnswer: string;
}

/**
 * [THE GOLDEN CODE] This is the definitive, robust component for editing chapters.
 * It uses a standard onSubmit handler for reliable FormData submission.
 * It includes a CRITICAL hidden input for `chapterId` to ensure validation passes on edits.
 * It resets the form on successful creation.
 * CRITICAL FIX: It now handles the quiz state as an array of objects, preventing uncontrolled component errors.
 * CRITICAL FIX 2: It now guarantees the options array always has 4 items, padding it if necessary.
 */
function ChapterEditor({ chapter, path, onSave, onCancel }: { chapter: Partial<Chapter>, path: string, onSave: (savedChapter: Chapter) => void, onCancel: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!chapter.id;

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionState[]>(
    (chapter.quiz && chapter.quiz.length > 0)
      ? chapter.quiz.map(q => {
          const options = Array.isArray(q.options) ? q.options : [];
          // Ensure there are always 4 options to prevent uncontrolled component errors.
          const paddedOptions = [...options, '', '', '', ''].slice(0, 4);
          return {
            questionText: q.questionText || '',
            options: paddedOptions,
            correctAnswer: q.correctAnswer || ''
          };
        })
      : [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
  );

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in to save.', variant: 'destructive' });
        return;
    }

    const formPayload = new FormData(e.currentTarget);
    const token = await user.getIdToken(true);
    formPayload.set('authToken', token);

    const quizPayload = quizQuestions
        .filter(q => q.questionText.trim() && q.correctAnswer.trim() && q.options.some(opt => opt.trim()))
        .map(q => ({
            ...q,
            options: q.options.filter(opt => opt.trim()),
        }));
    formPayload.set('quiz', JSON.stringify(quizPayload));
    
    if (isEditing) {
        formPayload.set('isEditing', 'true');
    }

    startTransition(async () => {
        const result = await saveSyllabusChapter(null, formPayload);

        if (result.success && result.savedChapter) {
            onSave(result.savedChapter);
            toast({
                title: 'Success!',
                description: result.message,
            });
            if (!isEditing) {
                formRef.current?.reset();
                setQuizQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
            }
        } else {
            const fieldErrors = result.errors ? Object.entries(result.errors).map(([key, value]) => `${key}: ${value}`).join(', ') : '';
            toast({
                title: 'Error Saving Chapter',
                description: result.message || fieldErrors || 'An unknown error occurred.',
                variant: 'destructive',
            });
        }
    });
  };
  
  const handleQuestionChange = useCallback((index: number, field: 'questionText' | 'correctAnswer', value: string) => {
    setQuizQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        return newQuestions;
    });
  }, []);

  const handleOptionChange = useCallback((qIndex: number, oIndex: number, value: string) => {
    setQuizQuestions(prev => {
        const newQuestions = [...prev];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
        return newQuestions;
    });
  }, []);

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <form ref={formRef} onSubmit={handleFormSubmit}>
        {/* Hidden inputs to ensure critical data is always submitted. */}
        <input type="hidden" name="path" value={path} />
        {/* THE CRITICAL FIX: This hidden input ensures the chapterId is submitted even when the visible input is disabled during edits. */}
        {isEditing && <input type="hidden" name="chapterId" value={chapter.id} />}
        
        <Card>
            <CardHeader>
            <CardTitle>{isEditing ? 'Edit Chapter' : 'Create New Chapter'}</CardTitle>
            <CardDescription>Fill in the content for a lesson chapter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="chapterIdInput">Chapter ID</Label>
                    <Input 
                        id="chapterIdInput" 
                        name="chapterId" 
                        defaultValue={chapter.id || ''} 
                        placeholder="e.g., bj-5 or gdd-5"
                        readOnly={isEditing} // Make read-only when editing
                        disabled={isEditing} // Disable to prevent user changes
                        required={!isEditing} // Only required when creating
                    />
                    <p className="text-xs text-muted-foreground">Cannot be changed after creation. Must be unique.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={chapter.title || ''} placeholder="Chapter Title" required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" defaultValue={chapter.description || ''} placeholder="A short description for the learning path view." required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content">Lesson Content</Label>
                    <Textarea id="content" name="content" defaultValue={chapter.content || ''} placeholder="The main text for the lesson page. You can use line breaks." rows={10} required/>
                </div>
            </CardContent>
        </Card>

        <Card className="mt-8">
            <CardHeader>
            <CardTitle>Mastery Quiz</CardTitle>
            <CardDescription>Add questions for the end-of-chapter quiz. Questions with empty fields will be ignored.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {quizQuestions.map((q, index) => (
                <div key={index} className="space-y-3 border bg-secondary/50 p-4 rounded-lg relative">
                
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeQuestion(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                
                    <div className="space-y-2">
                        <Label htmlFor={`q-text-${index}`}>Question {index + 1}</Label>
                        <Input id={`q-text-${index}`} value={q.questionText} onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)} placeholder="Question Text" />
                    </div>

                    <div className="space-y-2">
                        <Label>Options</Label>
                        <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIndex) => (
                            <Input key={oIndex} value={opt} onChange={(e) => handleOptionChange(index, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} />
                        ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`q-ans-${index}`}>Correct Answer</Label>
                        <Input id={`q-ans-${index}`} value={q.correctAnswer} onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)} placeholder="The exact text of the correct option" />
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" onClick={addQuestion}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
                <Button type="submit" disabled={isPending} size="lg">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isPending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Chapter')}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            </CardFooter>
        </Card>
    </form>
  )
}

const ChapterListItem = memo(function ChapterListItem({ chapter, onEdit, onDelete, isDeleting }: { chapter: Chapter, onEdit: (c: Chapter) => void, onDelete: (id: string) => void, isDeleting: boolean }) {
    return (
        <li className="p-4 flex justify-between items-center">
            <div>
                <p className="font-semibold">{chapter.title} <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">({chapter.id})</span></p>
                <p className="text-sm text-muted-foreground">{chapter.description}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(chapter)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the chapter "{chapter.title}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => onDelete(chapter.id)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Yes, delete it
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </li>
    );
});


function ContentManagementTab() {
  const [selectedPath, setSelectedPath] = useState('beginnerJourney');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [editingChapter, setEditingChapter] = useState<Partial<Chapter> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const fetchChapters = useCallback(async (path: string) => {
    setLoading(true);
    try {
        const response = await getSyllabusChapters(path);
        if (response.success && Array.isArray(response.data)) {
            setChapters(response.data);
        } else {
            console.error("Failed to fetch chapters or data is not an array:", response.error);
            toast({
                title: 'Error',
                description: response.error || 'Failed to fetch chapters.',
                variant: 'destructive',
            });
            setChapters([]);
        }
    } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch chapters. Please check server logs.',
          variant: 'destructive',
        });
        setChapters([]);
    } 
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => {
    fetchChapters(selectedPath);
  }, [selectedPath, fetchChapters]);

  const handleDelete = useCallback(async (chapterId: string) => {
    if (!user) {
        toast({ title: 'Not Logged In', description: 'You must be logged in to delete.', variant: 'destructive' });
        return;
    }
    setDeletingId(chapterId);
    startDeleteTransition(async () => {
        try {
            const authToken = await user.getIdToken(true);
            const result = await deleteSyllabusChapter(selectedPath, chapterId, authToken);
            toast({
                title: result.success ? 'Success!' : 'Error',
                description: result.message,
                variant: result.success ? 'default' : 'destructive',
            });
            if (result.success) {
                setChapters(prev => prev.filter(c => c.id !== chapterId));
            }
        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred during deletion.', variant: 'destructive' });
        } finally {
            setDeletingId(null);
        }
    });
  }, [selectedPath, toast, user]);
  
  const handleEdit = useCallback((chapter: Chapter) => {
      setEditingChapter(chapter);
  }, []);
  
  const handleCreateNew = useCallback(() => {
    setEditingChapter({});
  }, []);

  const handleSave = useCallback((savedChapter: Chapter) => {
      setChapters(prev => {
          const exists = prev.some(c => c.id === savedChapter.id);
          let newChapters;
          if (exists) {
              // If chapter exists, update it
              newChapters = prev.map(c => c.id === savedChapter.id ? savedChapter : c);
          } else {
              // If chapter is new, add it to the list
              newChapters = [...prev, savedChapter];
          }
          // Sort the chapters numerically by ID
          return newChapters.sort((a,b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
      });
      setEditingChapter(null); // Close editor on successful save
  }, []);

  const handleCancel = useCallback(() => {
      setEditingChapter(null);
  }, []);

  if (editingChapter) {
      return <ChapterEditor 
                chapter={editingChapter} 
                path={selectedPath}
                onSave={handleSave}
                onCancel={handleCancel}
            />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Syllabus Content</CardTitle>
        <CardDescription>Manage chapters for the learning paths. Select a path to see its chapters.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Label htmlFor="path-select">Learning Path:</Label>
                <Select value={selectedPath} onValueChange={setSelectedPath}>
                    <SelectTrigger id="path-select" className="w-[250px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="beginnerJourney">Beginner's Journey</SelectItem>
                    <SelectItem value="grammarDeepDive">Grammar Deep Dive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleCreateNew}>
                <PlusCircle className="mr-2" />
                Create New Chapter
            </Button>
        </div>

        <div className="border rounded-lg">
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : chapters.length === 0 ? (
                <p className="text-center text-muted-foreground p-8">No chapters found for this path. Create one!</p>
            ) : (
                <ul className="divide-y">
                    {chapters.map(chapter => (
                        <ChapterListItem 
                            key={chapter.id} 
                            chapter={chapter}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isDeleting={isDeleting && deletingId === chapter.id}
                        />
                    ))}
                </ul>
            )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          setIsAdmin(idTokenResult.claims.admin === true);
        } catch (error) {
          console.error("Error getting admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    if (!loading) {
       checkAdminStatus();
    }
  }, [user, loading]);

  if (loading || isAdmin === null) {
     return (
      <div className="flex justify-center items-center h-screen bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen bg-secondary">
        <Card className="w-full max-w-sm shadow-2xl text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center"><BookLock className="mr-2"/>Access Denied</CardTitle>
              <CardDescription>
                You do not have the necessary permissions to view this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Please contact the system administrator if you believe this is an error. You may need to be granted admin rights.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
        <div>
            <h1 className="font-headline text-3xl md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
                Full control panel for managing content, inspecting AI, and viewing user data.
            </p>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
            <TabsTrigger value="content">
              <BookLock className="mr-2" />
              Syllabus
            </TabsTrigger>
             <TabsTrigger value="videos">
              <Video className="mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="inspector">
              <Cpu className="mr-2" />
              AI Flows
            </TabsTrigger>
             <TabsTrigger value="progress">
              <Users className="mr-2" />
              User Progress
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            <ContentManagementTab />
          </TabsContent>
           <TabsContent value="videos" className="mt-6">
            <VideoManagementTab />
          </TabsContent>
          <TabsContent value="inspector" className="mt-6">
            <AiFlowInspector />
          </TabsContent>
           <TabsContent value="progress" className="mt-6">
            <UserProgressViewer />
          </TabsContent>
        </Tabs>
    </div>
  );
}
