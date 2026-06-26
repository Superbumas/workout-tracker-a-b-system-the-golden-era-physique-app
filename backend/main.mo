import AccessControl "authorization/access-control";
import Principal "mo:base/Principal";
import OrderedMap "mo:base/OrderedMap";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Float "mo:base/Float";



actor {
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type ExperienceLevel = {
    #beginner;
    #intermediate;
  };

  public type UserProfile = {
    experienceLevel : ExperienceLevel;
    startDate : Time.Time;
    unlockedSessions : [Text];
  };

  public type SetLog = {
    weight : Float;
    reps : Nat;
  };

  public type ExerciseLog = {
    name : Text;
    sets : [SetLog];
  };

  public type WarmUpActivity = {
    name : Text;
    durationMinutes : Float; // Duration in minutes
    completed : Bool;
  };

  public type CoolDownActivity = {
    name : Text;
    durationMinutes : Float; // Duration in minutes
    completed : Bool;
  };

  public type WorkoutSession = {
    date : Time.Time;
    sessionType : Text;
    exercises : [ExerciseLog];
    warmUpActivities : [WarmUpActivity];
    coolDownActivities : [CoolDownActivity];
  };

  public type SetSpecificWeight = {
    exerciseName : Text;
    setIndex : Nat;
    weight : Float;
  };

  public type ExerciseType = {
    #barbell;
    #dumbbell;
    #bodyweight;
  };

  public type Exercise = {
    name : Text;
    sets : Nat;
    reps : Nat;
    exerciseType : ExerciseType;
    description : Text;
    videoUrl : ?Text;
    icon : Text;
  };

  transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
  var userProfiles = principalMap.empty<UserProfile>();
  var workoutHistory = principalMap.empty<[WorkoutSession]>();
  var setSpecificWeights = principalMap.empty<[SetSpecificWeight]>();
  var exercises : [Exercise] = [];

  /// Update or add an entire workout session for the current caller.
  public shared ({ caller }) func upsertWorkoutSession(session : WorkoutSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can upsert workout sessions");
    };

    let userHistory = switch (principalMap.get(workoutHistory, caller)) {
      case (?history) history;
      case null [];
    };

    // Filter out any existing session with the same date and session type.
    let filteredHistory = Array.filter<WorkoutSession>(
      userHistory,
      func(existingSession : WorkoutSession) : Bool {
        existingSession.date != session.date or existingSession.sessionType != session.sessionType
      },
    );

    // Add the new session to the filtered history and update the map.
    let updatedHistory = Array.append(filteredHistory, [session]);
    workoutHistory := principalMap.put(workoutHistory, caller, updatedHistory);

    // Update set-specific weights.
    let currentSetSpecific = switch (principalMap.get(setSpecificWeights, caller)) {
      case (?weights) weights;
      case null [];
    };

    let newSetSpecific = Array.flatten(
      Array.map<ExerciseLog, [SetSpecificWeight]>(
        session.exercises,
        func exercise {
          Array.tabulate<SetSpecificWeight>(
            exercise.sets.size(),
            func i {
              {
                exerciseName = exercise.name;
                setIndex = i;
                weight = exercise.sets[i].weight;
              };
            },
          );
        },
      )
    );

    let combinedSetSpecific = Array.append(currentSetSpecific, newSetSpecific);
    setSpecificWeights := principalMap.put(setSpecificWeights, caller, combinedSetSpecific);
  };

  public shared ({ caller }) func deleteWorkoutSession(date : Time.Time, sessionType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can delete workout sessions");
    };

    let userHistory = switch (principalMap.get(workoutHistory, caller)) {
      case (?history) history;
      case null [];
    };

    // Filter out the specified session.
    let filteredHistory = Array.filter<WorkoutSession>(
      userHistory,
      func(session : WorkoutSession) : Bool {
        session.date != date or session.sessionType != sessionType;
      },
    );

    // Update the workout history map.
    workoutHistory := principalMap.put(workoutHistory, caller, filteredHistory);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access profiles");
    };
    principalMap.get(userProfiles, caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Debug.trap("Unauthorized: Can only view your own profile");
    };
    principalMap.get(userProfiles, user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := principalMap.put(userProfiles, caller, profile);
  };

  public shared ({ caller }) func saveWorkoutSession(session : WorkoutSession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can save workout sessions");
    };

    let userHistory = switch (principalMap.get(workoutHistory, caller)) {
      case (?history) history;
      case null [];
    };

    let updatedHistory = Array.append(userHistory, [session]);
    workoutHistory := principalMap.put(workoutHistory, caller, updatedHistory);

    // Update set-specific weights
    let currentSetSpecific = switch (principalMap.get(setSpecificWeights, caller)) {
      case (?weights) weights;
      case null [];
    };

    let newSetSpecific = Array.flatten(
      Array.map<ExerciseLog, [SetSpecificWeight]>(
        session.exercises,
        func exercise {
          Array.tabulate<SetSpecificWeight>(
            exercise.sets.size(),
            func i {
              {
                exerciseName = exercise.name;
                setIndex = i;
                weight = exercise.sets[i].weight;
              };
            },
          );
        },
      )
    );

    let combinedSetSpecific = Array.append(currentSetSpecific, newSetSpecific);
    setSpecificWeights := principalMap.put(setSpecificWeights, caller, combinedSetSpecific);
  };

  public query ({ caller }) func getWorkoutHistory() : async [WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access workout history");
    };

    switch (principalMap.get(workoutHistory, caller)) {
      case (?history) history;
      case null [];
    };
  };

  public query ({ caller }) func getSessionAExercises() : async [Exercise] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access workout exercises");
    };

    [
      {
        name = "Squat";
        sets = 5;
        reps = 6;
        exerciseType = #barbell;
        description = "Keep your back straight, go parallel only, and maintain control throughout the movement.";
        videoUrl = ?"https://www.youtube.com/watch?v=Dy28eq2PjcM";
        icon = "barbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Bench Press";
        sets = 5;
        reps = 6;
        exerciseType = #barbell;
        description = "Pause on chest for 1 second, maintain tightness, and avoid locking out elbows.";
        videoUrl = ?"https://www.youtube.com/watch?v=SCVCLChPQFY";
        icon = "barbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Wide Pull Up";
        sets = 3;
        reps = 6;
        exerciseType = #bodyweight;
        description = "Use a wide grip, pull chest to bar, and control the descent.";
        videoUrl = ?"https://www.youtube.com/watch?v=eGo4IYlbE5g";
        icon = "dumbbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Behind The Neck Press";
        sets = 3;
        reps = 6;
        exerciseType = #barbell;
        description = "Press bar behind head, keep elbows slightly forward, and avoid excessive arching.";
        videoUrl = ?"https://www.youtube.com/watch?v=QhVC_AnZYYM";
        icon = "barbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Pendlay Row";
        sets = 3;
        reps = 6;
        exerciseType = #barbell;
        description = "Start from the floor, keep back parallel, and pull explosively.";
        videoUrl = ?"https://www.youtube.com/watch?v=9efgcAjQe7E";
        icon = "barbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Sit Up";
        sets = 3;
        reps = 10;
        exerciseType = #bodyweight;
        description = "Keep feet anchored, use controlled movement, and avoid pulling on neck.";
        videoUrl = ?"https://www.youtube.com/watch?v=1fbU_MkV7NE";
        icon = "dumbbell-icon-transparent.dim_64x64.png";
      },
    ];
  };

  public query ({ caller }) func getSessionBExercises() : async [Exercise] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access workout exercises");
    };

    [
      {
        name = "Deadlift";
        sets = 5;
        reps = 6;
        exerciseType = #barbell;
        description = "Keep back straight, drive through heels, and avoid rounding shoulders.";
        videoUrl = ?"https://www.youtube.com/watch?v=ytGaGIn3SjE";
        icon = "barbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Incline Bench";
        sets = 5;
        reps = 6;
        exerciseType = #barbell;
        description = "Maintain 30-45 degree angle, control descent, and avoid bouncing bar.";
        videoUrl = ?"https://www.youtube.com/watch?v=SrqOu55lrYU";
        icon = "barbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Wide Pull Up";
        sets = 3;
        reps = 6;
        exerciseType = #bodyweight;
        description = "Use a wide grip, pull chest to bar, and control the descent.";
        videoUrl = ?"https://www.youtube.com/watch?v=eGo4IYlbE5g";
        icon = "dumbbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Dips";
        sets = 3;
        reps = 6;
        exerciseType = #bodyweight;
        description = "Keep elbows close, lower to 90 degrees, and avoid swinging.";
        videoUrl = ?"https://www.youtube.com/watch?v=2z8JmcrW-As";
        icon = "dumbbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Pendlay Row";
        sets = 3;
        reps = 6;
        exerciseType = #barbell;
        description = "Start from the floor, keep back parallel, and pull explosively.";
        videoUrl = ?"https://www.youtube.com/watch?v=9efgcAjQe7E";
        icon = "barbell-icon-transparent.dim_64x64.png";
      },
      {
        name = "Sit Up";
        sets = 3;
        reps = 10;
        exerciseType = #bodyweight;
        description = "Keep feet anchored, use controlled movement, and avoid pulling on neck.";
        videoUrl = ?"https://www.youtube.com/watch?v=1fbU_MkV7NE";
        icon = "dumbbell-icon-transparent.dim_64x64.png";
      },
    ];
  };

  public query ({ caller }) func getTechniqueCues() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access technique cues");
    };

    [
      "Do Not Lock Out",
      "Maintain Time Under Tension",
      "Squat: Parallel only",
      "Bench: Pause on chest 1 second",
    ];
  };

  public query ({ caller }) func getAvailableSessions() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access available sessions");
    };

    switch (principalMap.get(userProfiles, caller)) {
      case (?profile) profile.unlockedSessions;
      case null ["A"];
    };
  };

  public query ({ caller }) func getCurrentExperienceLevel() : async ExperienceLevel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access experience level");
    };

    switch (principalMap.get(userProfiles, caller)) {
      case (?profile) profile.experienceLevel;
      case null #beginner;
    };
  };

  public query ({ caller }) func getWorkoutProgress() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access workout progress");
    };

    switch (principalMap.get(workoutHistory, caller)) {
      case (?history) history.size();
      case null 0;
    };
  };

  public query ({ caller }) func getDefaultSetStructure() : async {
    mainLifts : [SetLog];
    supplementalLifts : [SetLog];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access workout structure");
    };

    let mainLifts = Array.tabulate<SetLog>(5, func _ { { weight = 0.0; reps = 6 } });
    let supplementalLifts = Array.tabulate<SetLog>(3, func _ { { weight = 0.0; reps = 6 } });
    {
      mainLifts;
      supplementalLifts;
    };
  };

  public query ({ caller }) func getSetSpecificWeights() : async [SetSpecificWeight] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access set specific weights");
    };

    switch (principalMap.get(setSpecificWeights, caller)) {
      case (?weights) weights;
      case null [];
    };
  };

  public query ({ caller }) func getLastUsedWeightForSet(exerciseName : Text, setIndex : Nat) : async ?Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access last used weights");
    };

    switch (principalMap.get(setSpecificWeights, caller)) {
      case (?weights) {
        let matchingWeights = Array.filter<SetSpecificWeight>(
          weights,
          func w { w.exerciseName == exerciseName and w.setIndex == setIndex },
        );
        if (matchingWeights.size() > 0) {
          ?matchingWeights[matchingWeights.size() - 1].weight;
        } else {
          null;
        };
      };
      case null null;
    };
  };

  public query ({ caller }) func getLastUsedWeightsForExercise(exerciseName : Text) : async [Float] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access last used weights");
    };

    switch (principalMap.get(setSpecificWeights, caller)) {
      case (?weights) {
        let exerciseWeights = Array.filter<SetSpecificWeight>(
          weights,
          func w { w.exerciseName == exerciseName },
        );

        let maxSetIndex = Array.foldLeft<SetSpecificWeight, Nat>(
          exerciseWeights,
          0,
          func(acc : Nat, w) { if (w.setIndex > acc) w.setIndex else acc },
        );

        Array.tabulate<Float>(
          maxSetIndex + 1,
          func i {
            let setWeights = Array.filter<SetSpecificWeight>(
              exerciseWeights,
              func w { w.setIndex == i },
            );
            if (setWeights.size() > 0) {
              setWeights[setWeights.size() - 1].weight;
            } else {
              0.0;
            };
          },
        );
      };
      case null [];
    };
  };

  public query ({ caller }) func getWarmUpActivities() : async [WarmUpActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access warm-up activities");
    };

    switch (principalMap.get(workoutHistory, caller)) {
      case (?history) {
        if (history.size() > 0) {
          history[history.size() - 1].warmUpActivities;
        } else {
          [];
        };
      };
      case null [];
    };
  };

  public query ({ caller }) func getCoolDownActivities() : async [CoolDownActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Debug.trap("Unauthorized: Only users can access cool-down activities");
    };

    switch (principalMap.get(workoutHistory, caller)) {
      case (?history) {
        if (history.size() > 0) {
          history[history.size() - 1].coolDownActivities;
        } else {
          [];
        };
      };
      case null [];
    };
  };
};

