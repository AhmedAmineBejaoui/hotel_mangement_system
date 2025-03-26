import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Moon, Sun, User, Bell, LockKeyhole, UserCog2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";

// Schéma pour le formulaire de profil
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Le nom d'utilisateur doit comporter au moins 3 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional(),
  fullName: z.string().optional(),
});

// Schéma pour le formulaire de sécurité
const securityFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Le mot de passe actuel doit comporter au moins 6 caractères.",
  }),
  newPassword: z.string().min(6, {
    message: "Le nouveau mot de passe doit comporter au moins 6 caractères.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Veuillez confirmer votre nouveau mot de passe.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

// Schéma pour le formulaire de notifications
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  appNotifications: z.boolean().default(true),
  reservationAlerts: z.boolean().default(true),
  paymentAlerts: z.boolean().default(true),
  systemUpdates: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Formulaire de profil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: "",
      fullName: "",
    },
  });

  // Mise à jour des valeurs par défaut lorsque l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      profileForm.setValue("username", user.username);
    }
  }, [user, profileForm]);

  // Formulaire de sécurité
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Formulaire de notifications
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      appNotifications: true,
      reservationAlerts: true,
      paymentAlerts: true,
      systemUpdates: false,
    },
  });

  // Soumission du formulaire de profil
  function onProfileSubmit(values: ProfileFormValues) {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations de profil ont été mises à jour avec succès.",
    });
  }

  // Soumission du formulaire de sécurité
  function onSecuritySubmit(values: SecurityFormValues) {
    toast({
      title: "Mot de passe mis à jour",
      description: "Votre mot de passe a été modifié avec succès.",
    });
    securityForm.reset();
  }

  // Soumission du formulaire de notifications
  function onNotificationsSubmit(values: NotificationsFormValues) {
    toast({
      title: "Préférences de notification mises à jour",
      description: "Vos préférences de notification ont été mises à jour avec succès.",
    });
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Basculer le thème</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <UserCog2 className="h-4 w-4" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>
                Gérez les informations de votre profil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Nom d'utilisateur utilisé pour vous connecter.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormDescription>
                          Pour les notifications et récupérations de compte.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Votre nom complet affiché sur votre profil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Sauvegarder</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
              <CardDescription>
                Modifiez votre mot de passe et gérez les paramètres de sécurité.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe actuel</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          Minimum 6 caractères, idéalement avec des chiffres et des caractères spéciaux.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Changer le mot de passe</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configurez vos préférences de notification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-4">
                  <FormField
                    control={notificationsForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Notifications par email</FormLabel>
                          <FormDescription>
                            Recevoir des notifications par email.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationsForm.control}
                    name="appNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Notifications dans l'application</FormLabel>
                          <FormDescription>
                            Recevoir des notifications dans l'application.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationsForm.control}
                    name="reservationAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Alertes de réservation</FormLabel>
                          <FormDescription>
                            Recevoir des alertes pour les nouvelles réservations.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationsForm.control}
                    name="paymentAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Alertes de paiement</FormLabel>
                          <FormDescription>
                            Recevoir des alertes pour les nouveaux paiements.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationsForm.control}
                    name="systemUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Mises à jour système</FormLabel>
                          <FormDescription>
                            Recevoir des notifications pour les mises à jour système.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Sauvegarder</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Apparence */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Thème</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Card 
                    className={`cursor-pointer transition-all p-4 flex flex-col items-center ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme("light")}
                  >
                    <div className="size-24 bg-[#F8FAFC] border rounded-md mb-2 flex items-center justify-center">
                      <Sun className="h-10 w-10 text-primary" />
                    </div>
                    <span className="font-medium">Clair</span>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all p-4 flex flex-col items-center ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme("dark")}
                  >
                    <div className="size-24 bg-[#1E293B] border rounded-md mb-2 flex items-center justify-center">
                      <Moon className="h-10 w-10 text-primary" />
                    </div>
                    <span className="font-medium">Sombre</span>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all p-4 flex flex-col items-center ${theme === 'system' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme("system")}
                  >
                    <div className="size-24 bg-gradient-to-br from-[#F8FAFC] to-[#1E293B] border rounded-md mb-2 flex items-center justify-center">
                      <Sun className="h-7 w-7 text-primary translate-x-[-6px]" />
                      <Moon className="h-7 w-7 text-primary translate-x-[6px]" />
                    </div>
                    <span className="font-medium">Système</span>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Les préférences d'apparence sont enregistrées automatiquement.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}