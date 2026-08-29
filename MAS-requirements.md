Design and Analysis of Information
Systems (MAS)
Updated: 2026 - 03 - 09
Lecturer: Mariusz Trzaska , Ph. D. ( mtrzaska@pjwstk.edu.pl , https://www.mtrzaska.com )
Introduction
The Design and Analysis of Information Systems (MAS) course focuses on developing
the skills required to transition from a conceptual model - produced during the analysis
and requirements specification phase of the software development life cycle - to a
concrete object-oriented implementation environment. Students learn how to map
conceptual constructs to specific implementation platforms (currently Java), including
how to handle conceptual features that do not have direct counterparts in these
environments. The course also introduces selected principles of user interface design
(with emphasis on usability) and the practical use of software frameworks. Lectures are
complemented by hands-on implementation exercises covering data management,
application behavior, and the development of simple graphical user interfaces (GUIs).
Requirements specification and static analysis should be carried out in parallel with the
course Object Modelling Techniques in Software Analysis (PRI).
Schedule
No. (^) Lecture Tutorial
1 Designing and Modelling
of System Architecture

A brief introduction to the course and a
presentation of the project objectives.
Exercises in dynamic analysis.
Classes include drawing diagrams based
on specified requirements. Students may
use a dedicated CASE tool or a traditional
whiteboard.
2 Selected Constructs of
Object-oriented
Programming Languages
Practice of selected constructs of an object-
oriented programming language.
Classes involve developing programs using
various design approaches and patterns.
The nature and scope of the exercises depend
on the group’s level (as determined by the
instructor) and may be aligned with the lecture
content.
3 Selected Constructs of
Object-oriented
Programming Languages
(2)
Practice of selected constructs of an object-
oriented programming language.
4 Using Classes in Object-
oriented Programming
Practice of selected constructs of an object-
oriented programming language.
Languages
5 Associations in Object-
oriented Programming
Languages

Practice in implementing associations in
object-oriented programming languages
(1).
Evaluation of Mini Project 1 MP1 (based
on lecture material concerning classes).
6 Associations in Object-

oriented Programming
Languages (2)
Practice of implementing association in object-
oriented programming languages (2).
7 Inheritance in Object-

oriented Programming
Languages
Practice in implementing different
inheritance models in object-oriented
programming languages.
Evaluation of Mini Project 2 MP2 (based
on lecture material concerning
associations).
8 Implementation of Other

UML Constructs in Object-
oriented Programming
Languages
Practice in implementing various UML
structures (constraints) in object-oriented
programming languages.
9 Relational Model in Object-
oriented Programming
Languages

Evaluation of Mini Project 3 MP
(based on lecture material concerning
inheritance).
Practice in implementing the relational
model in object-oriented programming
languages.
10 Relational Model in Object-
oriented Programming
Languages (2)

Practice in implementing the relational model in
object-oriented programming languages.
11 Usability of Graphical User
Interfaces

Evaluation of a Mini Project MP 4
( based on lecture material concerning
relational model)
Work on the final project.
12 Design and

Implementation of
Graphical User Interfaces
Practice in implementing graphical user
interfaces, including the use of a
dedicated GUI editor.
Work on the final project.
13 Design and
Implementation of
Graphical User Interfaces
(2)

Practice in implementing graphical user
interfaces, including the use of a
dedicated GUI editor.
Work on the final project.
Deadline for submitting the project
documentation ; late submissions will
not be accepted.
14 Design and

Implementation of
Evaluation of the final project
Graphical User Interfaces
(3)
implementation.
15 Design and
Implementation of
Graphical User Interfaces
(4)
All matters relating to the final evaluation of the
course.
Mini-projects
The purpose of the mini projects is to practically verify students’ understanding of how to
implement specific constructs from the conceptual model (such as classes, associations,
extents, etc.) and their interaction with the relational model. Additionally, they can serve
as a “foundation” for the final project, which will later be expanded with additional
elements, including a graphical user interface (GUI).
Students are expected to implement various business-oriented constructs (technical
details such as the number of objects in an extent, setters/getters, or object display do
not apply) present in the conceptual model. Each mini project must be implemented as a
console application and include sample data and/or methods demonstrating correct
functionality (located in the main() method).
Defense dates are specified in the attached class schedule. During the defense, students
may be asked questions regarding the topics covered and the implementation approach.
It is possible to submit mini projects at later sessions, but doing so will result in a 50%
reduction in points.
Students must propose their own business cases for the mini projects; examples from
lectures, books, or other sources are not allowed.
Elements of the mini projects subject to evaluation include:
MP 01
Classes, attributes
MP 02
Associations
MP 03
Inheritance
MP 04
Relational model^1
A class extent
A class extent –
persistence
A complex attribute
An optional attribute
A multi-value
attribute
A class attribute
A derived attribute
A class method
Method overriding
and overloading
- “Basic”
- With an attribute
- Qualified
- Composition
In every case:
cardinality 1-* or *-
* and automatic
creation of a
reverse
connection.
- An abstract class
and polymorphic
method invocation
- An overlapping
inheritance
- A multi-inheritance
- A multi-aspect
inheritance
- A dynamic
inheritance
- RM - classes
- RM – associations (1-* or
-)
- RM - inheritance.
You are required to create a
working program that uses a
database and implements
the above constructs. You
must use an ORM (Object-
Relational Mapping) tool,
such as Hibernate or Entity
Framework.
The topic of each mini project (MPx) may, but does not have to, be related to the topic of
the final project.
(^1) Relational model (MR) is not applicable for students of Department of Information Management
(WZI).

Examples for different constructs must not be combined; for instance, each type of
attribute must have its own separate business case.
Due to the anti-plagiarism procedure (see below), the implementation of each MPx must
be uploaded to the designated folder in the Gakko/EduX system (file name:
“ MPx_LastName_FirstName_IndexNumber.zip ”, source files only without binaries,
libraries etc.).
Mini projects are an integral part of the final grade (see Section 5.1), so it is important to
complete them thoroughly.
The final project
The project consists of two parts: a documentation part and an implementation part. The
topic should be chosen so that it allows for the creation of a sufficient number of
meaningful business classes (typically 12–15). Therefore, tool-based applications,
system utilities, media players, and similar types of software are generally not suitable. If
you are unsure about your topic, you should consult the course instructor.
4.1. Documentation
4.1.1. The documentation may, but does not have to, be based on a project from the
PRI course.
4.1.2. The project should be grounded in user requirements described as
enumeration “user stories.”
4.1.3. Based on these requirements, you should develop: Functional requirements
(represented as use case diagrams and optionally in textual form), Non-
functional requirements (presented in some kind of enumeration).
4.1.4. A key component of the requirements is the analytical class diagram. Since it
serves as the foundation for further work, it is essential that it is error-free.
Without a correct analytical class diagram, it is impossible to prepare a proper
design (implementation) class diagram.
4.1.5. At least one non-trivial use case (which references another use case) must be
discussed in detail. The scenario for this use case should be described both in
natural language and using activity diagrams.
4.1.6. User interface design: Based on the selected non-trivial use case, a user
interface design should be created following the guidelines presented in the
lectures.
4.1.7. Dynamic analysis: For the selected use case, perform dynamic analysis using
activity diagrams and state diagrams. This analysis should conclude with an
explicit discussion of its implications. The results of the dynamic analysis (e.g.,
new attributes, new associations) must be reflected in the implementation
(design) class diagram. The project must utilize all the types of diagrams
mentioned above.
4.1.8. Include elements that specify design and implementation decisions, illustrated
with examples from the relevant diagrams (e.g., how class extents or inheritance
are implemented).
4.1.9. Based on the analytical class diagram, an implementation (design) class
diagram is created. It may include only elements derived from the analytical
diagram and should:
a. Be detailed and fully specified.
b. Replace any constructs that do not exist in the chosen programming language
according to the design decisions made.
c. Optionally include methods resulting from the dynamic analysis.
4.1.10. The entire documentation, and especially the diagrams, must be clear and
readable. It is recommended to use a vector format (e.g., Enhanced Metafile ) or
a lossless compression format (e.g., PNG). To ensure clarity, pay attention to
the following:
a. Correct use of UML notation (do not use “similar” graphical elements).
b. Every diagram must be properly labeled.
c. Diagrams should be prepared using an appropriate tool (e.g., UMLet ).
d. Font sizes on diagrams should be readable without excessive zooming (an
A4 diagram at 100% zoom should be legible; if necessary, increase the font
size rather than the entire diagram).
e. Diagrams should not be split into multiple parts.
f. Elements (e.g., classes) must be properly arranged, e.g.: inheritance
vertically, associations horizontally, avoid crossing lines, and associations
should include names and multiplicities.
Note : Projects containing unreadable diagrams will not be evaluated.
A prepared guide can be helpful in creating readable diagrams.

4.1.11. Documentation should be delivered in a single PDF file
( MAS_Group_Lastname_Firstname_StudentNo.pdf ) sent to the email address of
the teacher. Deadline - see the attached schedule.

4.1.12. The project documentation should include the following elements:

a. User requirements (“user story”)
b. Use case diagrams (functional requirements)
c. Non-functional requirements
d. Analytical class diagram
e. Design (implementation) class diagram
f. Use case scenario (as an enumeration)
g. Activity diagram for the use case
h. State diagram for a class
i. GUI design
j. Discussion of design decisions and the results of dynamic analysis
4.1.13. The grade for the project documentation will be assigned according to the
following table, provided that the requirements from Section 4.1 are met:
Criterion Max points

The complexity of the business domain 10
Documenting use case(s) (scenario and diagram) 10
Correctness and complexity of the design (implementation)
class diagram
35
Correctness and complexity of the activity diagram 10
Correctness and complexity of the state diagram 10
GUI design 10
Discussion of design decisions 10
Readability and organization of the document 5
Total 100
4.2. Implementation

4.2.1. The complete structure, including all classes with appropriate associations,
inheritance, etc.
4.2.2. Methods required to implement the selected use case(s).
4.2.3. Graphical user interface (GUI) elements necessary to demonstrate a working
implementation of the selected use case. Every project must include a GUI.
4.2.4. The minimum GUI implementation must allow interaction between at least two
classes connected by an association (target multiplicity: “many”).
a. For example, if the diagram shows two classes connected by an
association, e.g., Company and Employee , the GUI should include: a
widget displaying multiple items (e.g., a ListBox ) showing the list of
companies; when a company is selected, another widget (also displaying
multiple items, e.g. ListBox ) shows the list of its employees, retrieved
through the defined association (this generally means no use of query
languages, including SQL).
b. A GUI that only creates connections between objects but does not allow
the above interaction is insufficient for passing the project.
c. Similarly, solutions with only one widget, a single TextBox , a target
multiplicity of “1,” or filtering data from the extent instead of using the
predefined association are also insufficient.
4.2.5. The implementation must include sample data that demonstrates correct
functionality of the application.
4.2.6. Pay attention to the quality, ergonomics, and usability of the GUI (e.g., window
scaling, color scheme, interaction design). This is an important component of
the final grade. GUI design and implementation (using dedicated editors if
desired) should follow usability principles presented in the lectures.
4.2.7. All data stored in the system must be persistent (e.g., using a file, database,
or dedicated library). Ensure the chosen technology is appropriate (e.g.,
serialization is not suitable for web applications) and correctly implemented
(e.g., serialization requires a single shared file for all extents).
4.2.8. Avoid including obvious comments describing the source code.
4.2.9. The implementation part of the project will be individually reviewed during
class sessions (see details later).
4.2.10. The implementation can be done in Java, C#, or C++. Using other languages
requires prior approval from the course instructor.
4.2.11. The grade for the implementation will be assigned according to the table
below, provided that the requirements from Section 4.2 are met:
Criterion
Max
points
Complexity, scope and correctness of the implemented
functionality
20
Scope and correctness of implemented object-oriented
constructs
25
Code quality (naming, structure, API comments etc.) 5
Elegance of implemented solutions 15
Data persistence implementation 10
GUI implementation (including usability and ergonomics) 20
Project presentation 5
Total 100
The final project does not need to include all the constructs implemented in the mini
projects (MPx).
4.3. Each project will be individually reviewed. During the defense, students can expect
detailed questions about the implementation (source code), such as: “ What would
happen if...? ”, “ Why was this done this way...? ”, “ Please make the following
modification... ”. Students who have completed the project independently should
have no difficulty answering these questions. Failure to answer these questions will
result in not passing the course.
4.4. Due to the anti-plagiarism procedure (see below), the project implementation must
be uploaded to the designated folder in the Gakko/EduX system before the individual
defense. The file name: “ ProjectImpl_LastName_FirstName_Number.zip ” (source
files only without binaries, libraries etc.).
Tutorials completion
The final grade for the tutorials consists of the following components:
5.1. The total points from all mini projects are counted (it is not required to pass each
individual element separately; only the overall sum matters): 2 4 + 2 4 + 2 4 + 2 8 =
100 pts.,
5.2. Project Implementation Grade
5.3. Project Documentation Grade
A passing grade is required for each of the components 5.1, 5.2, and 5.3. Therefore, a
student who, for example, passes the mini projects but fails the project documentation
will not pass the course.
Additionally, up to 15 bonus points can be earned by completing exercises assigned
during lectures. These bonus points are added to the overall total (see Section 5.1)
provided that at least 50% of the base points have been earned.
Anti-Plagiarism Policy
All source code submitted for evaluation (mini projects and the final project) will be
subjected to an anti-plagiarism check. In case code borrowing from other programs is
detected:
6.1. All programs containing shared code will receive 0 points.
6.2. It is not possible to submit a corrected version of such a program , which may
result in failing the course with no chance of retake in the current semester.
6.3. No investigations will be conducted to determine who copied from whom.
Before the defense of any mini project (MPx) or the final project, the code must be
uploaded to the designated folder in the Gakko/EduX system. Deadlines will be set by the
course instructor.
Deadlines
The deadlines for completing individual tasks (mini projects, final project documentation,
final project implementation) are provided in the table in Section 2. Failure to meet these
deadlines will result in a significant reduction of the grade, up to a failing mark.
It is not possible to pass the course after the semester has ended, conditionally via an
exam, or during a retake session.
The exam
The MAS exam consists of two parts, and the final score is the sum of points from both
parts:
8.1. Test. You should evaluate each of the questions (Y / N). Correct answer is + 2 points,
Incorrect - 2 points, No answer: 0 points.
8.2. Assignment exercises. You must name and briefly explain the implementation of
the marked constructs on the provided class diagram.
There are no exemptions from the exam.
An example exam: http://www.mtrzaska.com/mas-egzamin.
Resources
9.1. General information about the course (newer versions may be made available):
https://www.mtrzaska.com/tags/mas-en/
9.2. The electronic version of the lectures:
https://www.mtrzaska.com/tags/mas-en/
Due to the complexity of the topics covered, attendance at lectures is strongly
recommended , even though the materials are available online.
9.3. New book (Polish version only): M. Trzaska: „Modelowanie i implementacja
systemów informatycznych 2.0”. Year 2025. Pages 468. ISBN 978- 83 - 976442 - 0 - 5.
Electronic version (PDF eBook) – compatible with
Windows, iOS, Android, mobile devices, and e-readers,
available in the Empik online bookstore ( more info ).
9.4. Sample programming tasks

These programming tasks are intended only as guidance for practicing programming
concepts covered in previous courses. Their solutions will not be graded as part of
the MAS ( Modeling and Analysis of Information Systems ) course.
They can be used during the “Selected Constructs of Object-Oriented Programming
Languages” classes. Students beginning the MAS course are expected to be able to
solve the vast majority of these tasks.
https://www.mtrzaska.com/tags/mas-en/
9.5. Free books on-line:

9.5.1. Bruce Eckel - Thinking in Java: http://www.mindview.net/Books/TIJ/
9.5.2. Allen B. Downey - How to Think Like a Computer Scientist: Java Version:
http://www.greenteapress.com/thinkapjava/
9.5.3. Robert Sedgewick and Kevin Wayne - Introduction to Programming in Java:
An Interdisciplinary Approach: http://introcs.cs.princeton.edu/home/
9.6. Implementation tools

Due to the fact that there is quite a large freedom to choose the technology of the project,
there is no mandatory tools list. However, the following list contains tools, which can be

useful:

CASE tools (including diagramming editors):
o UMLet ( open source , multiplatform): https://www.umlet.com/
o Visual Paradigm Community Edition: http://www.visual-paradigm.com
(also on-line edition),
o Lucid Charts https://lucid.app/ (also on-line edition),
o ArgoUML: http://argouml.tigris.org/,
o MagicDraw Community Edition: http://www.magicdraw.com,
o StarUML: http://staruml.sourceforge.net/en/,
o NetBeans for Java: http://www.netbeans.org/ (allows, for example, the
creation of UML diagrams and source code generation)
o MS Visio (ELMS license available for PJAIT students)
o A comprehensive list of tools:
http://en.wikipedia.org/wiki/List_of_UML_tools.
IDE
o IntelliJ IDEA (free Community ): https://www.jetbrains.com/idea/
o Eclipse for Java: http://www.eclipse.org/,
o NetBeans for Java: http://www.netbeans.org/,
o MS Visual Studio (ELMS license available for PJIIT students)
GUI editors
o Included in NetBeans;
o For Eclipse: Jigloo SWT/Swing GUI Builder
(http://www.cloudgarden.com/jigloo/);
o For Eclipse: WindowBuilder Pro - free to use after the acquisition by
Google (http://code.google.com/intl/pl/webtoolkit/tools/wbpro);
o Included in MS Visual Studio.
If you have any doubts or questions, please contact your class tutor.