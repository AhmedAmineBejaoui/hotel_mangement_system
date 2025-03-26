import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Hotel } from "lucide-react";

// Schémas de validation pour l'authentification
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Le nom d'utilisateur doit comporter au moins 3 caractères.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit comporter au moins 6 caractères.",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Le nom d'utilisateur doit comporter au moins 3 caractères.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit comporter au moins 6 caractères.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Veuillez confirmer votre mot de passe.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Formulaire de connexion
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Formulaire d'inscription
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Soumission du formulaire de connexion
  function onLoginSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  // Soumission du formulaire d'inscription
  function onRegisterSubmit(values: RegisterFormValues) {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Section formulaire */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Hotel className="h-12 w-12 text-primary mb-4" />
            <h2 className="mt-6 text-3xl font-extrabold text-foreground">
              Hotel Management System
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Solution complète de gestion hôtelière pour maximiser l'efficacité opérationnelle
            </p>
          </div>

          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte pour gérer votre hôtel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <Input placeholder="utilisateur" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Connexion en cours..." : "Se connecter"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Pas encore de compte?{" "}
                    <Button className="p-0" onClick={() => setActiveTab("register")}>
                      Créer un compte
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Inscription</CardTitle>
                  <CardDescription>
                    Créez un compte pour accéder au système de gestion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <Input placeholder="utilisateur" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Création du compte..." : "Créer un compte"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Déjà un compte?{" "}
                    <Button className="p-0" onClick={() => setActiveTab("login")}>
                      Se connecter
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Section informative */}
      <div className="relative hidden lg:block lg:w-1/2 bg-gradient-to-r from-primary/10 to-primary/30">
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Gérez votre hôtel en toute simplicité
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Gestion complète des chambres</h3>
                  <p className="text-muted-foreground">
                    Suivi en temps réel de l'état des chambres et leur disponibilité.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Réservations simplifiées</h3>
                  <p className="text-muted-foreground">
                    Créez et gérez facilement toutes vos réservations en quelques clics.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Gestion des paiements</h3>
                  <p className="text-muted-foreground">
                    Suivez les paiements et générez des rapports financiers détaillés.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Base de données clients</h3>
                  <p className="text-muted-foreground">
                    Accédez rapidement aux informations détaillées de vos clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}