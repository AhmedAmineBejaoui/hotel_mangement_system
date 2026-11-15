import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import pg from 'pg';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

const PostgresSessionStore = connectPg(session);

// Configurations pour la connexion DB
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be configured before starting the server");
}
const dbUrl = connectionString;

// Extraction des paramètres de connexion
let user, password, host, port, database;
try {
  const url = new URL(dbUrl);
  const userParts = url.username && url.password ? 
    [url.username, url.password] : 
    (url.username ? [url.username, ''] : ['postgres', 'postgres']);
  
  user = decodeURIComponent(userParts[0]);
  password = decodeURIComponent(userParts[1] || '');
  host = url.hostname;
  port = parseInt(url.port || '5432');
  database = url.pathname.substring(1);
  
  console.log(`Configuration DB: connexion à ${host}:${port}/${database} en tant que ${user}`);
} catch (error: any) {
  console.error(`Erreur lors de l'analyse de l'URL de la base de données: ${error.message}`);
  throw new Error('URL de base de données invalide: ' + error.message);
}

// Détection du type de base de données
const isLocalDatabase = host === 'localhost' || host === '127.0.0.1';
console.log(`Connexion à une base de données ${isLocalDatabase ? 'locale' : 'distante'}`);

// Configuration du pool
const pgPool = new pg.Pool({
  user,
  password,
  host,
  port,
  database,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
});

pgPool.on('error', (err) => {
  console.error(`Erreur de connexion PostgreSQL pour les sessions: ${err.message}`);
  setTimeout(() => {
    console.log('Tentative de reconnexion à PostgreSQL...');
    pgPool.connect();
  }, 5000);
});

function log(message: string, context: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${context}] ${message}`);
}

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return secret;
}

export function setupAuth(app: Express) {
        const sessionSettings: session.SessionOptions = {
            secret: requireSessionSecret(),
            resave: false,
            saveUninitialized: false,
            store: new PostgresSessionStore({
                pool: pgPool, 
                // Désactivé createTableIfMissing car la table existe déjà
                createTableIfMissing: false,
                tableName: 'session', // Utilise le nom par défaut
                pruneSessionInterval: 60 * 15 // Nettoie les sessions toutes les 15 minutes
            }),
            cookie: {
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
                secure: process.env.NODE_ENV === 'production',
            }
        };
    
        app.set("trust proxy", 1);
        app.use(session(sessionSettings));
        app.use(passport.initialize());
        app.use(passport.session());
    
        passport.use(
            new LocalStrategy(async (username, password, done) => {
                try {
                    // Validation des entrées
                    if (typeof username !== 'string' || typeof password !== 'string') {
                        log('Tentative d\'authentification avec des paramètres de type invalide', 'auth');
                        return done(new Error('Le nom d\'utilisateur et le mot de passe doivent être des chaînes de caractères'));
                    }
    
                    // Récupération de l'utilisateur
                    const user = await storage.getUserByUsername(username);
                    
                    // Vérification de l'existence de l'utilisateur
                    if (!user) {
                        log(`Tentative de connexion avec un utilisateur inexistant: ${username}`, 'auth');
                        return done(null, false);
                    }
                    
                    // Vérification du mot de passe
                    const isPasswordValid = await comparePasswords(password, user.password);
                    if (!isPasswordValid) {
                        log(`Mot de passe incorrect pour l'utilisateur: ${username}`, 'auth');
                        return done(null, false);
                    }
                    
                    // Authentification réussie
                    log(`Authentification réussie pour: ${username}`, 'auth');
                    return done(null, user);
                } catch (error: any) {
                    // Gestion des erreurs
                    log(`Erreur lors de l'authentification: ${error.message}`, 'auth');
                    return done(error);
                }
            }),
        );
    
        passport.serializeUser((user, done) => done(null, user.id));
        passport.deserializeUser(async (id: number, done) => {
            const user = await storage.getUser(id);
            done(null, user);
        });
    
        app.post("/api/register", async (req, res, next) => {
            try {
                // Vérifier que le mot de passe est bien une chaîne de caractères
                if (typeof req.body.password !== 'string') {
                    return res.status(400).json({
                        error: "Le mot de passe doit être une chaîne de caractères"
                    });
                }
    
                const existingUser = await storage.getUserByUsername(req.body.username);
                if (existingUser) {
                    return res.status(400).json({
                        error: "Ce nom d'utilisateur existe déjà"
                    });
                }
    
                // Hacher le mot de passe
                const hashedPassword = await hashPassword(req.body.password);
                
                // Créer l'utilisateur avec le mot de passe haché
                const user = await storage.createUser({
                    username: req.body.username,
                    password: hashedPassword,
                });
    
                // Connecter l'utilisateur
                req.login(user, (err) => {
                    if (err) {
                        log(`Erreur de connexion après inscription: ${err.message}`, 'auth');
                        return next(err);
                    }
                    
                    // Retourner l'utilisateur créé sans le mot de passe
                    const { password, ...userWithoutPassword } = user;
                    res.status(201).json(userWithoutPassword);
                });
            } catch (error: any) {
                log(`Erreur lors de l'inscription: ${error.message}`, 'auth');
                next(error);
            }
        });
    
        app.post("/api/login", (req, res, next) => {
            try {
                // Vérifier que le nom d'utilisateur et le mot de passe sont des chaînes
                if (typeof req.body.username !== 'string' || typeof req.body.password !== 'string') {
                    return res.status(400).json({
                        error: "Le nom d'utilisateur et le mot de passe doivent être des chaînes de caractères"
                    });
                }
                
                // Utiliser passport pour l'authentification
                passport.authenticate('local', (err: any, user: Express.User | false, info: any) => {
                    if (err) {
                        log(`Erreur d'authentification: ${err.message}`, 'auth');
                        return next(err);
                    }
                    
                    if (!user) {
                        return res.status(401).json({
                            error: "Nom d'utilisateur ou mot de passe incorrect"
                        });
                    }
                    
                    // Connecter l'utilisateur
                    req.login(user, (loginErr) => {
                        if (loginErr) {
                            log(`Erreur de connexion: ${loginErr.message}`, 'auth');
                            return next(loginErr);
                        }
                        
                        // Retourner l'utilisateur sans le mot de passe
                        const { password, ...userWithoutPassword } = user;
                        return res.status(200).json(userWithoutPassword);
                    });
                })(req, res, next);
            } catch (error: any) {
                log(`Erreur lors de la connexion: ${error.message}`, 'auth');
                next(error);
            }
        });
    
        app.post("/api/logout", (req, res, next) => {
            req.logout((err) => {
                if (err) return next(err);
                res.sendStatus(200);
            });
        });
    
        app.get("/api/user", (req, res) => {
            if (!req.isAuthenticated()) return res.sendStatus(401);
            res.json(req.user);
        });
    }

// Removed duplicate log function implementation
